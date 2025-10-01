<?php
    namespace App\Controllers;
    use App\Services\Sc_ChatborAI;
    class Ctrl_ChatBotAI {
        protected $chatService;
        public function __construct() {
            $this->chatService = new Sc_ChatborAI();
        }
        // Lấy danh sách tin nhắn
        public function getMessages() {
            try {
                $messages = $this->chatService->getMessageList();
                return [
                    'success' => true,
                    'data' => $messages
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        // Thêm tin nhắn mới
        public function addMessage(){
            try{
                $result = $this->chatService->addMessage();
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Tin nhắn đã được thêm thành công.'
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => 'Không thể thêm tin nhắn. Vui lòng đăng nhập.'
                    ];
                }
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
    }
?>