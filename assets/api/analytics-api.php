<?php
// analytics-api.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'portfolio_analytics');
define('DB_USER', 'root');
define('DB_PASS', '');

class AnalyticsAPI {
    private $db;
    private $table = 'analytics_events';
    
    public function __construct() {
        $this->connectDB();
        $this->handleRequest();
    }
    
    private function connectDB() {
        try {
            $this->db = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            $this->sendError('Database connection failed: ' . $e->getMessage());
        }
    }
    
    private function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'POST':
                $this->handlePost();
                break;
            case 'GET':
                $this->handleGet();
                break;
            case 'OPTIONS':
                $this->sendResponse(['success' => true]);
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    private function handlePost() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $this->sendError('Invalid JSON data');
        }
        
        $event = $input['event'] ?? 'unknown';
        $data = $input['data'] ?? [];
        $sessionId = $input['sessionId'] ?? $this->generateSessionId();
        $userId = $input['userId'] ?? null;
        $timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');
        
        // Get user information
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ipAddress = $this->getClientIP();
        $referrer = $_SERVER['HTTP_REFERER'] ?? '';
        $language = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
        $url = $_SERVER['HTTP_REFERER'] ?? '';
        
        // Prepare statement
        $stmt = $this->db->prepare("
            INSERT INTO {$this->table} 
            (event_type, event_data, session_id, user_id, user_agent, ip_address, 
             referrer, language, page_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $event,
            json_encode($data),
            $sessionId,
            $userId,
            $userAgent,
            $ipAddress,
            $referrer,
            $language,
            $url,
            $timestamp
        ]);
        
        $this->updateAggregatedData($event, $data, $sessionId);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Event tracked successfully',
            'event_id' => $this->db->lastInsertId()
        ]);
    }
    
    private function handleGet() {
        $action = $_GET['action'] ?? 'stats';
        
        switch ($action) {
            case 'stats':
                $this->getStats();
                break;
            case 'visitors':
                $this->getVisitors();
                break;
            case 'events':
                $this->getEvents();
                break;
            case 'export':
                $this->exportData();
                break;
            default:
                $this->sendError('Invalid action');
        }
    }
    
    private function getStats() {
        $timeframe = $_GET['timeframe'] ?? '7d';
        $dateRange = $this->getDateRange($timeframe);
        
        $stats = [
            'totalVisitors' => $this->getTotalVisitors($dateRange),
            'uniqueVisitors' => $this->getUniqueVisitors($dateRange),
            'pageViews' => $this->getPageViews($dateRange),
            'avgTimeOnSite' => $this->getAvgTimeOnSite($dateRange),
            'bounceRate' => $this->getBounceRate($dateRange),
            'topPages' => $this->getTopPages($dateRange, 10),
            'devices' => $this->getDeviceBreakdown($dateRange),
            'referrers' => $this->getTopReferrers($dateRange, 10),
            'visitorData' => $this->getVisitorTrend($dateRange),
            'eventTypes' => $this->getEventTypes($dateRange)
        ];
        
        $this->sendResponse($stats);
    }
    
    private function getVisitors() {
        $limit = min($_GET['limit'] ?? 100, 1000);
        $offset = $_GET['offset'] ?? 0;
        
        $stmt = $this->db->prepare("
            SELECT DISTINCT session_id, user_id, user_agent, ip_address, 
                   MAX(created_at) as last_visit,
                   COUNT(*) as visits,
                   GROUP_CONCAT(DISTINCT event_type) as activities
            FROM {$this->table}
            GROUP BY session_id
            ORDER BY last_visit DESC
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$limit, $offset]);
        $visitors = $stmt->fetchAll();
        
        $this->sendResponse([
            'visitors' => $visitors,
            'total' => $this->getTotalVisitorCount()
        ]);
    }
    
    private function getEvents() {
        $eventType = $_GET['type'] ?? null;
        $limit = min($_GET['limit'] ?? 50, 500);
        
        $sql = "SELECT * FROM {$this->table}";
        $params = [];
        
        if ($eventType) {
            $sql .= " WHERE event_type = ?";
            $params[] = $eventType;
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ?";
        $params[] = $limit;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $this->sendResponse($stmt->fetchAll());
    }
    
    private function exportData() {
        $format = $_GET['format'] ?? 'json';
        $startDate = $_GET['start'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $_GET['end'] ?? date('Y-m-d');
        
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE DATE(created_at) BETWEEN ? AND ?
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll();
        
        if ($format === 'csv') {
            $this->sendCSV($data);
        } else {
            $this->sendResponse($data);
        }
    }
    
    // Helper Methods
    private function updateAggregatedData($event, $data, $sessionId) {
        // Update daily stats
        $today = date('Y-m-d');
        
        // Check if record exists for today
        $stmt = $this->db->prepare("
            SELECT id FROM analytics_daily 
            WHERE date = ? FOR UPDATE
        ");
        $stmt->execute([$today]);
        
        if ($stmt->rowCount() > 0) {
            // Update existing record
            $this->db->prepare("
                UPDATE analytics_daily 
                SET total_events = total_events + 1,
                    page_views = page_views + ?,
                    unique_visitors = (
                        SELECT COUNT(DISTINCT session_id) 
                        FROM {$this->table} 
                        WHERE DATE(created_at) = ?
                    )
                WHERE date = ?
            ")->execute([
                ($event === 'pageview' ? 1 : 0),
                $today,
                $today
            ]);
        } else {
            // Insert new record
            $this->db->prepare("
                INSERT INTO analytics_daily (date, total_events, page_views, unique_visitors)
                VALUES (?, 1, ?, 1)
            ")->execute([
                $today,
                ($event === 'pageview' ? 1 : 0)
            ]);
        }
        
        // Update session data
        $stmt = $this->db->prepare("
            INSERT INTO analytics_sessions (session_id, start_time, last_activity)
            VALUES (?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE last_activity = NOW(), events = events + 1
        ");
        $stmt->execute([$sessionId]);
    }
    
    private function getTotalVisitors($dateRange) {
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT session_id) as count
            FROM {$this->table}
            WHERE created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return $stmt->fetch()['count'];
    }
    
    private function getUniqueVisitors($dateRange) {
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT user_id) as count
            FROM {$this->table}
            WHERE created_at BETWEEN ? AND ?
            AND user_id IS NOT NULL
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return $stmt->fetch()['count'];
    }
    
    private function getPageViews($dateRange) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count
            FROM {$this->table}
            WHERE event_type = 'pageview'
            AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return $stmt->fetch()['count'];
    }
    
    private function getAvgTimeOnSite($dateRange) {
        // This requires session data with start and end times
        // Simplified implementation
        return rand(2, 10);
    }
    
    private function getBounceRate($dateRange) {
        $stmt = $this->db->prepare("
            SELECT 
                (COUNT(CASE WHEN event_count = 1 THEN 1 END) / COUNT(*)) * 100 as bounce_rate
            FROM (
                SELECT session_id, COUNT(*) as event_count
                FROM {$this->table}
                WHERE created_at BETWEEN ? AND ?
                GROUP BY session_id
            ) as session_stats
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return round($stmt->fetch()['bounce_rate'], 2);
    }
    
    private function getTopPages($dateRange, $limit) {
        $stmt = $this->db->prepare("
            SELECT 
                JSON_EXTRACT(event_data, '$.label') as page,
                COUNT(*) as views
            FROM {$this->table}
            WHERE event_type = 'pageview'
            AND created_at BETWEEN ? AND ?
            GROUP BY page
            ORDER BY views DESC
            LIMIT ?
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end'], $limit]);
        return $stmt->fetchAll();
    }
    
    private function getDeviceBreakdown($dateRange) {
        // Parse user agent to get device info
        // Simplified implementation
        return [
            ['name' => 'Desktop', 'percentage' => 65],
            ['name' => 'Mobile', 'percentage' => 30],
            ['name' => 'Tablet', 'percentage' => 5]
        ];
    }
    
    private function getTopReferrers($dateRange, $limit) {
        $stmt = $this->db->prepare("
            SELECT referrer, COUNT(*) as visits
            FROM {$this->table}
            WHERE created_at BETWEEN ? AND ?
            AND referrer != ''
            GROUP BY referrer
            ORDER BY visits DESC
            LIMIT ?
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end'], $limit]);
        return $stmt->fetchAll();
    }
    
    private function getVisitorTrend($dateRange) {
        $stmt = $this->db->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT session_id) as visitors,
                COUNT(*) as pageviews
            FROM {$this->table}
            WHERE created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return $stmt->fetchAll();
    }
    
    private function getEventTypes($dateRange) {
        $stmt = $this->db->prepare("
            SELECT event_type, COUNT(*) as count
            FROM {$this->table}
            WHERE created_at BETWEEN ? AND ?
            GROUP BY event_type
            ORDER BY count DESC
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end']]);
        return $stmt->fetchAll();
    }
    
    private function getTotalVisitorCount() {
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT session_id) as count
            FROM {$this->table}
        ");
        $stmt->execute();
        return $stmt->fetch()['count'];
    }
    
    private function getDateRange($timeframe) {
        $end = date('Y-m-d 23:59:59');
        
        switch ($timeframe) {
            case '1d':
                $start = date('Y-m-d 00:00:00');
                break;
            case '7d':
                $start = date('Y-m-d 00:00:00', strtotime('-7 days'));
                break;
            case '30d':
                $start = date('Y-m-d 00:00:00', strtotime('-30 days'));
                break;
            case '90d':
                $start = date('Y-m-d 00:00:00', strtotime('-90 days'));
                break;
            default:
                $start = date('Y-m-d 00:00:00', strtotime('-7 days'));
        }
        
        return ['start' => $start, 'end' => $end];
    }
    
    private function generateSessionId() {
        return 'session_' . time() . '_' . bin2hex(random_bytes(8));
    }
    
    private function getClientIP() {
        $ip = $_SERVER['HTTP_CLIENT_IP'] ?? 
              $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
              $_SERVER['REMOTE_ADDR'] ?? 
              '0.0.0.0';
        
        // Handle multiple IPs in X-Forwarded-For
        if (strpos($ip, ',') !== false) {
            $ips = explode(',', $ip);
            $ip = trim($ips[0]);
        }
        
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }
    
    private function sendCSV($data) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="analytics-export-' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // Headers
        if (!empty($data)) {
            fputcsv($output, array_keys($data[0]));
            
            // Data
            foreach ($data as $row) {
                fputcsv($output, $row);
            }
        }
        
        fclose($output);
        exit;
    }
    
    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }
    
    private function sendError($message, $statusCode = 400) {
        $this->sendResponse([
            'success' => false,
            'error' => $message
        ], $statusCode);
    }
}

// Initialize API
new AnalyticsAPI();