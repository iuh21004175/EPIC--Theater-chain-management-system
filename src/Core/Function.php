<?php
    namespace App\Core;

    use eftec\bladeone\BladeOne;

    function view($name, $data = [])
    {
        $blade = new BladeOne(
            __DIR__ . '/../Views',
            __DIR__ . '/../../cache/views',
            BladeOne::MODE_AUTO // or BladeOne::MODE_AUTO or BladeOne::MODE_SLOW
        );
        return $blade->run($name, $data);
    }
?>