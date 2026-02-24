<?php
$conn = new mysqli("localhost", "root", "", "college");

// Sorting
$sort = "name";
if(isset($_GET['sort'])) {
    $sort = $_GET['sort'];
}

// Filtering
$department = "";
if(isset($_GET['department'])) {
    $department = $_GET['department'];
}

// Query
$sql = "SELECT * FROM students";

if($department != "") {
    $sql .= " WHERE department='$department'";
}

$sql .= " ORDER BY $sort";

$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
<title>Student Dashboard</title>
<style>
table {
    border-collapse: collapse;
    width: 70%;
    margin: 20px auto;
}
th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
}
</style>
</head>
<body>

<h2 align="center">Student Dashboard</h2>

<!-- Sorting -->
<div align="center">
    <a href="?sort=name">Sort by Name</a> |
    <a href="?sort=admission_date">Sort by Date</a>
</div>

<br>

<!-- Filter -->
<form method="GET" align="center">
    <select name="department">
        <option value="">All Departments</option>
        <option value="CSE">CSE</option>
        <option value="ECE">ECE</option>
        <option value="MECH">MECH</option>
    </select>
    <input type="submit" value="Filter">
</form>

<br>

<!-- Table -->
<table>
<tr>
    <th>ID</th>
    <th>Name</th>
    <th>Department</th>
    <th>Admission Date</th>
</tr>

<?php
while($row = $result->fetch_assoc()) {
    echo "<tr>
            <td>{$row['id']}</td>
            <td>{$row['name']}</td>
            <td>{$row['department']}</td>
            <td>{$row['admission_date']}</td>
          </tr>";
}
?>
</table>

<?php
// Count students per department
$count_sql = "SELECT department, COUNT(*) as total FROM students GROUP BY department";
$count_result = $conn->query($count_sql);

echo "<h3 align='center'>Student Count Per Department</h3>";
echo "<table align='center'>";
echo "<tr><th>Department</th><th>Total Students</th></tr>";

while($row = $count_result->fetch_assoc()) {
    echo "<tr>
            <td>{$row['department']}</td>
            <td>{$row['total']}</td>
          </tr>";
}
echo "</table>";
?>

</body>
</html>