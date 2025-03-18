<?php
require_once __DIR__ . "/../config/database.php";

// Set response header to JSON
header("Content-Type: application/json");

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Create product
function createProduct($conn) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data->name || !$data->price) {
        http_response_code(400);
        echo json_encode(['message' => 'Name and price are required']);
        return;
    }
    
    $query = "INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    $stmt->execute([
        $data->name,
        $data->description,
        $data->price,
        $data->image_url ?? null
    ]);
    
    http_response_code(201);
    echo json_encode(['message' => 'Product created successfully']);
}

// Get all products with optional search and filter
function getProducts($conn) {
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $min_price = isset($_GET['min_price']) ? floatval($_GET['min_price']) : 0;
    $max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : PHP_FLOAT_MAX;
    $sort = isset($_GET['sort']) ? $_GET['sort'] : '';
    
    // Base query
    $query = "SELECT * FROM products WHERE price >= ? AND price <= ?";
    $params = [$min_price, $max_price];
    
    // Add search condition if provided
    if (!empty($search)) {
        $query .= " AND (name LIKE ? OR description LIKE ? )";
        array_push($params, "%$search%", "%$search%");
    }
    
    // Add sorting
    if ($sort === 'price_asc') {
        $query .= " ORDER BY price ASC";
    } elseif ($sort === 'price_desc') {
        $query .= " ORDER BY price DESC";
    } else {
        $query .= " ORDER BY id DESC";
    }

    // Add pagination
    $query .= " LIMIT $limit OFFSET $offset";

    $stmt = $conn->prepare($query);

    // Bind the existing params dynamically
    foreach ($params as $key => $param) {
        $stmt->bindValue($key + 1, $param); // Correct parameter binding
    }

    $stmt->execute();

    // Get total count for pagination
    $count_query = "SELECT COUNT(*) as count FROM products WHERE price >= ? AND price <= ?";
    $count_params = [$min_price, $max_price];
    
    if (!empty($search)) {
        $count_query .= " AND (name LIKE ? OR description LIKE ?)";
        array_push($count_params, "%$search%", "%$search%");
    }
    
    $count_stmt = $conn->prepare($count_query);
    $count_stmt->execute($count_params);
    $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Execute main query
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'data' => $products,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'pages' => ceil($total / $limit)
    ]);
}

// Get single product
function getProduct($conn, $id) {
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($product) {
        echo json_encode($product);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Product not found']);
    }
}

// Update product
function updateProduct($conn, $id) {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(['message' => 'Product not found']);
        return;
    }
    
    $query = "UPDATE products SET 
              name = ?, 
              description = ?, 
              price = ?, 
              image_url = ? 
              WHERE id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([
        $data->name ?? $product['name'],
        $data->description ?? $product['description'],
        $data->price ?? $product['price'],
        $data->image_url ?? $product['image_url'],
        $id
    ]);
    
    echo json_encode(['message' => 'Product updated successfully']);
}

// Delete product
function deleteProduct($conn, $id) {
    $query = "DELETE FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Product deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Product not found']);
    }
}

// Route the request
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        getProduct($conn, $_GET['id']);
    } else {
        getProducts($conn);
    }
} elseif ($method === 'POST') {
    createProduct($conn);
} elseif ($method === 'PUT') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        updateProduct($conn, $id);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Product ID is required']);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        deleteProduct($conn, $id);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Product ID is required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>