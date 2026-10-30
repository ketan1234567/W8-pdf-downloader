<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Sweden/Swedish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf";

$fields = [
"firstname" => "firstname",
"lastname" => 0,
"email" => 1,
"company" => 2,
"company_size" => 3,
"job_title" => 4,
//"job_role" => 4,
//"job_department" => 5,
"work_phone" => 6,
"country" => 7,
//"CQ" => 8,
"optin" => 23
   
];

$mapped_data = [];

foreach ($fields as $key => $value) {
    $mapped_data[$key] = is_numeric($value) ? $_POST["data"][$value] : $_POST[$value];
}



$camp_id = $_POST["camp_id"];
//DON'T CHANGE THIS CODE (Data Get From LP)
$URL = ($_SERVER['HTTP_REFERER']);
$firstname = $_POST["firstname"];
$temp=json_encode(array('Field Count' => count($mapped_data)) +  $mapped_data); 
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


$mail->Subject = '=?UTF-8?B?VGFjayBmw7ZyIGRpbiBiZWfDpHJhbg==?= "=?UTF-8?B?U8Oka3JhIEFJIG1lZCB0eWRsaWdhcmUgZGF0YWtvbnRyb2xsZXIK?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Dear <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

Tack f&#246;r ditt intresse f&#246;r v&#228;rdefullt Biz-Tech-Insights-inneh&#229;ll, med tillst&#229;nd av <b>Microsoft</b>.

</p>

<p style='text-align: justify; font-size: 14px;'>
Klick <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Sweden/Swedish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf'> h&#228;r </a> f&#246;r att f&#229; tillg&#229;ng till ditt beg&#228;rda inneh&#229;ll.
</p>


<p style='text-align: justify; font-size: 14px;'>

Om du beh&#246;ver n&#229;got, oavsett om det g&#228;ller produktunders&#246;kningar, k&#246;pr&#229;d eller tekniska insikter, finns vi alltid h&#228;r f&#246;r att hj&#228;lpa dig.
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>Uppriktigt,<br>Nina Ridgeway<br><span style='color:black;'>Biz-tech Insights<br><br></span></p>

<p style='text-align: justify; font-size: 14px;'>

P.S. Tack f&#246;r att du litar p&#229; oss med ditt behov av smart inneh&#229;ll.
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
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Sweden/Swedish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
