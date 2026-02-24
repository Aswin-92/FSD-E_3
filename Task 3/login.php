<?php
include "db.php";

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    header("Location: dashboard.php");
} else {
    echo "<script>
            alert('Invalid Username or Password');
            window.location.href='login.html';
          </script>";
}
?>
