<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Canada/French/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf";

$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
    "email" => 1,
	"company" => 2,
	"job_title" => 10,
	"company_size" => 3,
	//"job_role" => 4,
	//"job_department" => 5,
    "work_phone" => 6,
    "country" => 7,
	//"cq1" => 8,
	"optin" => 9
   
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


$mail->Subject = '=?UTF-8?B?TWVyY2kgZGUgdm90cmUgZGVtYW5kZQ==?= "=?UTF-8?B?U8OpY3VyaXNleiBs4oCZSUEgYXZlYyBkZXMgY29udHLDtGxlcyBkZSBkb25uw6llcyBwbHVzIGNsYWlycwo=?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Ch&#232;re <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

Merci de votre int&#233;r&#234;t pour le contenu pr&#233;cieux de Biz-Tech-Insights, gracieuset&#233; de <b>Microsoft</b>.

</p>
<p style='text-align: justify; font-size: 14px;'>
Cliquez <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Canada/French/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf'> ici</a>.pour acc&#233;der au contenu demand&#233;.
</p>


<p style='text-align: justify; font-size: 14px;'>

Besoin de quoi que ce soit, qu'il s'agisse d'une recherche de produits, de conseils d'achat ou d'informations techniques&#160;?

Nous sommes toujours l&#224; pour vous aider.
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>Sinc&#232;rement,<br>Nina Ridgeway<br><span style='color:black;'>Biz-tech Insights<br><br></span></p>


<p style='text-align: justify; font-size: 14px;'>

P.S. Merci de nous faire confiance pour votre besoin de contenu intelligent.
</p>

<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br>You received this email because you signed up for content from Biz-Tech-Insights.<br>You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed'>here</a> to unsubscribe.<br></p></center>




";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Canada/French/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
