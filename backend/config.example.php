<?php
// Copy to config.php inside stellora-private, alongside (NOT inside) public_html.
// Never commit config.php or include it in a downloadable archive.
return [
    'origin' => 'https://YOUR-DOMAIN.example',
    'smtp_host' => 'smtp.hostinger.com', // Confirm in your mailbox settings.
    'smtp_port' => 465,
    'smtp_encryption' => 'ssl', // ssl (465) or tls (587).
    'smtp_username' => '',
    'smtp_password' => '',
    'from_email' => '', // An authenticated mailbox on your own domain.
    'from_name' => 'Stellora Travels',
    'rate_limit_secret' => '', // Generate: php -r 'echo bin2hex(random_bytes(32));'
];
