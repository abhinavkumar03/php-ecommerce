<?php
// Route static files directly
if (file_exists(__DIR__ . $_SERVER['REQUEST_URI'])) {
    return false;
}

// Route dynamic files
require __DIR__ . '/api/product.php';
?>
