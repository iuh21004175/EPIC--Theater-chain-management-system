<?php
    namespace App\Core;

    use eftec\bladeone\BladeOne;
    use Aws\S3\S3Client;

    // Define the view function using the global $blade variable
    function view($name, $data = [])
    {
        static $blade = null;
        if ($blade === null) {
            $views = __DIR__ . '/../../src/Views';
            $cache = __DIR__ . '/../../cache/views';
            $blade = new BladeOne($views, $cache, BladeOne::MODE_AUTO);
        }
        return $blade->run($name, $data);
    }
    function getS3Client() {
        static $s3Client = null;
        if ($s3Client === null) {
            // Cấu hình Client
            $s3Client = new S3Client([
                'version' => 'latest',
                'region'  => 'us-east-1', // Bắt buộc, nhưng không quan trọng với MinIO
                'endpoint' => 'http://127.0.0.1:9000', // URL đến MinIO server của bạn
                'use_path_style_endpoint' => true, // Cực kỳ quan trọng!
                'credentials' => [
                    'key'    => 'admin_epic',     // Access Key bạn đã tạo
                    'secret' => 'epic2025', // Secret Key bạn đã tạo
                ],
            ]);

        }
        return $s3Client;
    }
?>