<?php require_once "./src/app.php" ?>

<!doctype html>
<html lang="hu" data-bs-theme="dark">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MedSys</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link rel="stylesheet" href="static/css/style.css" />
</head>

<body>

    <header>
        <h1>MedSys</h1>
        <p>Orvosi és pszichológiai alkalmassági nyilvántartás</p>
    </header>

    <main id="app"></main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>
    <script src="static/js/domino.js"></script>
    <script src="static/js/app.js"></script>
</body>

</html>