<?php
declare(strict_types=1);
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $status, string $message, bool $ok = false): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); reply(405, 'Please submit the enquiry form.');
}
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    reply(415, 'Please submit the enquiry form as JSON.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) reply(413, 'Your enquiry is too long.');
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) reply(413, 'Your enquiry is too long.');
try { $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR); }
catch (Throwable $e) { reply(400, 'The enquiry could not be read. Please try again.'); }
if (!is_array($data) || array_is_list($data)) reply(400, 'Invalid enquiry.');
function field(array $data, string $key, int $limit): string {
    $value = $data[$key] ?? '';
    if (!is_string($value) || strlen($value) > $limit) reply(422, 'Please check the length and format of your details.');
    return trim(str_replace(["\0", "\r"], '', $value));
}
$name = field($data, 'name', 300);
$phone = field($data, 'phone', 20);
$email = field($data, 'email', 254);
$service = field($data, 'service', 40);
$date = field($data, 'date', 10);
$pickup = field($data, 'pickup', 480);
$destination = field($data, 'destination', 480);
$message = field($data, 'message', 6000);
$website = field($data, 'website', 300);
$services = ['chauffeur'=>'Chauffeur-driven cars', 'self-drive'=>'Self-drive car rentals', 'bike'=>'Bike rentals', 'airport'=>'Airport transfers', 'tours'=>'Tour packages', 'wedding'=>'Wedding transport', 'visa'=>'Visa assistance', 'tickets'=>'Bus, train & flight tickets', 'hotel'=>'Hotel bookings', 'college'=>'College industrial visits'];
if ($website !== '') reply(400, 'Your enquiry could not be accepted. Please call us.');
if (strlen($name) < 2 || preg_match('/[\r\n]/', $name)) reply(422, 'Please enter your name.');
if (!preg_match('/^[+0-9() .-]{8,20}$/', $phone) || strlen(preg_replace('/\D/', '', $phone)) < 7) reply(422, 'Please enter a valid phone number.');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(422, 'Please enter a valid email address.');
if (!isset($services[$service])) reply(422, 'Please choose a service.');
$today = new DateTimeImmutable('today', new DateTimeZone('Asia/Kolkata'));
if ($date !== '') {
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('Asia/Kolkata'));
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $parsed < $today) reply(422, 'Please choose today or a future travel date.');
} elseif ($service !== 'visa') reply(422, 'Please choose a travel date.');
$needsPickup = in_array($service, ['chauffeur','self-drive','airport','tours','wedding','tickets','college'], true);
if ($needsPickup && $pickup === '') reply(422, 'Please enter your pickup location.');
if ($service !== 'bike' && $destination === '') reply(422, 'Please enter your destination.');
$privateDir = dirname(__DIR__, 2) . '/stellora-private';
$configFile = $privateDir . '/config.php';
if (!is_file($configFile)) reply(503, 'Online enquiries are temporarily unavailable. Please call +91 89397 83708 or use WhatsApp.');
$config = require $configFile;
if (!is_array($config)) reply(503, 'Online enquiries are temporarily unavailable. Please call us.');
foreach (['origin','smtp_host','smtp_username','smtp_password','from_email','rate_limit_secret'] as $key) {
    if (empty($config[$key])) reply(503, 'Online enquiries are temporarily unavailable. Please call +91 89397 83708 or use WhatsApp.');
}
if (strlen($config['rate_limit_secret']) < 32 || !filter_var($config['from_email'], FILTER_VALIDATE_EMAIL)) reply(503, 'Online enquiries are temporarily unavailable. Please call us.');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && rtrim($origin, '/') !== rtrim($config['origin'], '/')) reply(403, 'Please use the enquiry form on our website.');
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') reply(403, 'Please use the enquiry form on our website.');

// Store only salted IP digests and request times outside the public web root.
$rateDir = $privateDir . '/rate-limits';
if (!is_dir($rateDir) && !@mkdir($rateDir, 0700, true)) reply(503, 'Online enquiries are temporarily unavailable. Please call us.');
$key = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['rate_limit_secret']);
$rateFile = $rateDir . '/' . $key . '.json';
$handle = @fopen($rateFile, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) reply(503, 'Please try again later.');
$now = time();
$previous = json_decode(stream_get_contents($handle) ?: '[]', true);
$attempts = array_values(array_filter(is_array($previous) ? $previous : [], fn($t) => is_int($t) && $t > $now - 3600));
if (count($attempts) >= 5) {
    flock($handle, LOCK_UN); fclose($handle); header('Retry-After: 3600'); reply(429, 'Too many enquiries. Please try again later or call us.');
}
$attempts[] = $now;
rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($attempts)); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
// Bound retention of the anonymous rate-limit files.
if (random_int(1, 20) === 1) foreach (glob($rateDir . '/*.json') ?: [] as $file) {
    if (filemtime($file) < $now - 86400) @unlink($file);
}
$vendor = $privateDir . '/vendor/phpmailer';
foreach (['Exception.php','PHPMailer.php','SMTP.php'] as $file) {
    if (!is_file($vendor . '/src/' . $file)) reply(503, 'Online enquiries are temporarily unavailable. Please call us.');
    require_once $vendor . '/src/' . $file;
}
try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = ($config['smtp_encryption'] ?? 'ssl') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int)($config['smtp_port'] ?? 465);
    $mail->Timeout = 12;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from_email'], $config['from_name'] ?? 'Stellora Travels');
    $mail->addAddress('stelloratravels@gmail.com');
    if ($email !== '') $mail->addReplyTo($email, $name);
    $mail->Subject = 'Website enquiry: ' . $services[$service];
    $mail->isHTML(false);
    $mail->Body = "New Stellora Travels website enquiry\n\nName: {$name}\nPhone: {$phone}\nEmail: " . ($email ?: 'Not supplied') . "\nService: {$services[$service]}\nTravel date: " . ($date ?: 'Not supplied') . "\nPickup: " . ($needsPickup ? $pickup : 'Not applicable') . "\nDestination: " . ($service === 'bike' ? 'Not applicable' : $destination) . "\n\nMessage:\n" . ($message ?: 'No additional message') . "\n\nThis is an enquiry, not a confirmed booking.";
    $mail->send();
    reply(200, 'Your enquiry has been sent.', true);
} catch (Throwable $e) {
    // Do not expose SMTP internals or log customer details.
    error_log('Stellora enquiry delivery failed. Check server-side SMTP configuration.');
    reply(502, 'We could not send your enquiry. Please try again, call +91 89397 83708 or use WhatsApp.');
}
