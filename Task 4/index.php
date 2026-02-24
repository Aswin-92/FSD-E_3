<?php
include "db.php";
?>

<!DOCTYPE html>
<html>
<head>
    <title>Order Management</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<h2>Customer Order History</h2>

<table>
    <tr>
        <th>Customer</th>
        <th>Product</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Total</th>
        <th>Date</th>
    </tr>

<?php
$sql = "SELECT c.name, p.product_name, p.price, o.quantity,
        (p.price * o.quantity) AS total, o.order_date
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN products p ON o.product_id = p.product_id
        ORDER BY o.order_date DESC";

$result = $conn->query($sql);

while($row = $result->fetch_assoc()) {
    echo "<tr>
            <td>{$row['name']}</td>
            <td>{$row['product_name']}</td>
            <td>{$row['price']}</td>
            <td>{$row['quantity']}</td>
            <td>{$row['total']}</td>
            <td>{$row['order_date']}</td>
          </tr>";
}
?>
</table>

<hr>

<h3>Highest Value Order</h3>

<?php
$highest = "SELECT MAX(p.price * o.quantity) AS max_order
            FROM orders o
            JOIN products p ON o.product_id = p.product_id";

$res = $conn->query($highest);
$data = $res->fetch_assoc();

echo "<p>₹ " . $data['max_order'] . "</p>";
?>

<hr>

<h3>Most Active Customer</h3>

<?php
$active = "SELECT name FROM customers
           WHERE customer_id = (
               SELECT customer_id
               FROM orders
               GROUP BY customer_id
               ORDER BY COUNT(order_id) DESC
               LIMIT 1
           )";

$res2 = $conn->query($active);
$data2 = $res2->fetch_assoc();

echo "<p>" . $data2['name'] . "</p>";
?>

</body>
</html>
