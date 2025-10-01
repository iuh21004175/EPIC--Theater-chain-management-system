<?php
    namespace App\Services;
    class Sc_ChatborAI {
        // Lấy danh sách tin nhắn
        public function getMessageList() {
            // Kiểm tra xem người dùng đã đăng nhập hay chưa
            if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
                // Trả về mảng rỗng hoặc tin nhắn chào mừng cho người dùng chưa đăng nhập
                return [
                    [
                        'id' => uniqid(),
                        'noi_dung' => 'Vui lòng đăng nhập để bắt đầu chat!',
                        'loai_noi_dung' => 1,
                        'nguoi_gui' => null,
                        'created_at' => date('Y-m-d H:i:s')
                    ]
                ];
            }
            
            $userId = $_SESSION['user']['id'];
            $cookieName = 'chatbotai_history_' . $userId;
            
            // Kiểm tra cookie có tồn tại không
            if (!isset($_COOKIE[$cookieName]) || empty($_COOKIE[$cookieName])) {
                // Tạo tin nhắn chào mừng
                $welcomeMessage = [
                    'id' => uniqid(),
                    'noi_dung' => 'Chào bạn! Tôi là Chatbot AI, tôi có thể giúp gì cho bạn?',
                    'loai_noi_dung' => 1, // Text
                    'nguoi_gui' => null, // Hệ thống
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                // Lưu tin nhắn chào mừng vào cookie
                $chatHistory = [$welcomeMessage];
                setcookie($cookieName, json_encode($chatHistory), strtotime('tomorrow'), '/');
                
                return $chatHistory;
            } 
            
            // Nếu cookie tồn tại, decode an toàn
            try {
                $chatHistory = json_decode($_COOKIE[$cookieName], true);
                
                // Kiểm tra xem decode có thành công không
                if (is_null($chatHistory) || !is_array($chatHistory)) {
                    throw new \Exception("Invalid JSON in cookie");
                }
                
                return $chatHistory;
            } catch (\Exception $e) {
                // Log lỗi nếu cần
                // error_log("Error decoding chat history: " . $e->getMessage());
                
                // Reset cookie với giá trị mặc định
                $welcomeMessage = [
                    'id' => uniqid(),
                    'noi_dung' => 'Xin lỗi, có lỗi xảy ra. Chúng ta bắt đầu lại cuộc trò chuyện nhé!',
                    'loai_noi_dung' => 1,
                    'nguoi_gui' => null,
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                $chatHistory = [$welcomeMessage];
                setcookie($cookieName, json_encode($chatHistory), strtotime('tomorrow'), '/');
                
                return $chatHistory;
            }
        }
        
        /**
         * Thêm tin nhắn vào lịch sử chat
         * 
         * @param string $message Nội dung tin nhắn
         * @param int|null $nguoiGui 1: Khách hàng, null: AI
         * @param int $loaiNoiDung 1: Text, 2: Hình ảnh, ...
         * @return bool Thành công hay không
         */
        public function addMessage() {
            $message = $_POST['message'];
            $nguoiGui = isset($_POST['nguoi_gui']) ? intval($_POST['nguoi_gui']) : null; // 1: Khách hàng, null: AI
            // Kiểm tra xem người dùng đã đăng nhập hay chưa
            if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
                return false;
            }
            
            $userId = $_SESSION['user']['id'];
            $cookieName = 'chatbotai_history_' . $userId;
            
            // Lấy lịch sử chat hiện tại
            $chatHistory = [];
            if (isset($_COOKIE[$cookieName]) && !empty($_COOKIE[$cookieName])) {
                try {
                    $chatHistory = json_decode($_COOKIE[$cookieName], true);
                    
                    // Nếu không phải mảng hợp lệ, khởi tạo mảng mới
                    if (!is_array($chatHistory)) {
                        $chatHistory = [];
                    }
                } catch (\Exception $e) {
                    // Nếu có lỗi khi decode, khởi tạo mảng mới
                    $chatHistory = [];
                }
            }
            
            // Tạo tin nhắn mới
            $newMessage = [
                'id' => uniqid(),
                'noi_dung' => $message,
                'loai_noi_dung' => 1,
                'nguoi_gui' => $nguoiGui,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Thêm tin nhắn mới vào lịch sử
            $chatHistory[] = $newMessage;
            
            // Kiểm tra kích thước mảng, giới hạn lịch sử nếu cần
            // Cookie có giới hạn kích thước (~4KB), nên giữ lịch sử ngắn
            $maxHistoryLength = 50; // Giới hạn số tin nhắn lưu trữ
            if (count($chatHistory) > $maxHistoryLength) {
                // Cắt bớt lịch sử, giữ lại tin nhắn mới nhất
                $chatHistory = array_slice($chatHistory, -$maxHistoryLength);
            }
            
            // Lưu lịch sử mới vào cookie
            $encoded = json_encode($chatHistory);
            
            // Nếu chuỗi JSON quá lớn, có thể cần nén
            if (strlen($encoded) > 3500) { // Ngưỡng an toàn cho cookie
                // Giảm thêm số lượng tin nhắn
                $chatHistory = array_slice($chatHistory, -($maxHistoryLength/2)); 
                $encoded = json_encode($chatHistory);
            }
            
            $result = setcookie($cookieName, $encoded, strtotime('tomorrow'), '/');
            
            return $result;
        }
        
        
    }
?>