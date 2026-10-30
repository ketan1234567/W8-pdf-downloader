<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Mexico/Spanish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf";

$fields = [
"firstname" => "firstname",
"lastname" => 0,
"email" => 1,
"company" => 2,
"company_size" => 3,
//"job_role" => 4,
//"job_department" => 5,
"job_title" => 25,
"work_phone" => 6,
"country" => 7,
//"cq1" => 8,

"optin" => 23,
   
];

$mapped_data = [];

foreach ($fields as $key => $value) {
    $mapped_data[$key] = is_numeric($value) ? $_POST["data"][$value] : $_POST[$value];
}



$camp_id = $_POST["camp_id"];
//DON'T CHANGE THIS CODE (Data Get From LP)
$URL = ($_SERVER['HTTP_REFERER']);
$firstname = $_POST["firstname"];
$temp=json_encode( utf8_converter( array('Field Count' => count($mapped_data)) + $mapped_data ));
$pattern = '/[a-z0-9_\-\+\.]+@[a-z0-9\-]+\.([a-z]{2,4})(?:\.[a-z]{2})?/i';
preg_match_all($pattern, $temp, $matches);
$email = array_shift($matches[0]);
//DON'T CHANGE THIS CODE END





/*-------  API CALL ------------*/
$data = array( 'camp_id' => $camp_id, 'tempdata' => $temp,  'ip_address' => getClientIp(), 'URL' => array("URL"=>$URL,"END_URL"=>$ENDURL) );

dataCurlAPI(_W8_, $data);


 
                     
$mail->From = "campaign@b2b-insight.biz-tech-insights.com";
$mail->FromName = "Biz-Tech-Insights";
$mail->addAddress($email, $firstname);

$mail->isHTML(true);


$mail->Subject ='=?UTF-8?B?CkdyYWNpYXMgcG9yIHNvbGljaXRhcg==?= "=?UTF-8?B?QXNlZ3VyZSBlbCB1c28gZGUgbGEgSUEgY29uIGNvbnRyb2xlcyBkZSBkYXRvcyBtw6FzIGNsYXJvcwo=?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>
Estimada <b>$firstname</b>,
</p>

<p style='text-align: justify; font-size: 14px;'>
Gracias por su inter&#233;s en el valioso contenido de Biz-Tech-Insights, cortes&#237;a de <b>Microsoft</b>.
</p>

<p style='text-align: justify; font-size: 14px;'>
Hacer clic <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Mexico/Spanish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf'>aqu&#237;</a> para acceder al contenido solicitado.
</p>

<p style='text-align: justify; font-size: 14px;'>
Si necesita algo, ya sea investigaci&#243;n de productos, consejos de compra o informaci&#243;n tecnol&#243;gica, siempre estamos aqu&#237; para ayudarlo.
</p>

<p style='text-align: justify; font-size: 14px;'>
Atentamente,<br>
Nina Ridgeway<br>
Biz-Tech-Insights
</p>

<p style='text-align: justify; font-size: 14px;'>
P.S. Gracias por confiar en nosotros para satisfacer su necesidad de contenido inteligente.
</p>

<center>
<p style='text-align: center; font-size: 14px;'>
Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br><br>
You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our <a href='https://biz-tech-insights.com/privacy-policy/'>Privacy Policy</a> here, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br>
</p>
</center>
";
$mail->AltBody = "";


try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Mexico/Spanish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
