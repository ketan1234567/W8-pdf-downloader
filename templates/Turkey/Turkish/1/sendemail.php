<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Turkey/Turkish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf";

$fields = [
"firstname" => "firstname",
"lastname" => 0,
"email" => 1,
"company" => 2,
"company_size" => 3,
//"job_role" => 4,
//"job_function" => 5,
 "job_title" => 5,
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
//$temp=json_encode(array('Field Count' => count($mapped_data)) +  $mapped_data); 
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


$mail->Subject = '=?UTF-8?B?VGFsZWJpbml6IGnDp2luIHRlxZ9la2vDvHIgZWRlcml6?= "=?UTF-8?B?WWFwYXkgemVrYW7EsXrEsSBkYWhhIGHDp8SxayB2ZXJpIGtvbnRyb2xsZXJpeWxlIGfDvHZlbmNlIGFsdMSxbmEgYWzEsW4K?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Can&#305;m <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
De&#287;erli Biz-Tech-Insights i&#231;eri&#287;ine olan ilginiz i&#231;in te&#351;ekk&#252;r ederiz. <b>Microsoft</b>.

</p>
<p style='text-align: justify; font-size: 14px;'>
Tıklamak <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Turkey/Turkish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf'> Burada</a> &#304;stedi&#287;iniz i&#231;eri&#287;e eri&#351;mek i&#231;in.
</p>


<p style='text-align: justify; font-size: 14px;'>
&#220;r&#252;n ara&#351;t&#305;rmas&#305;, sat&#305;n alma tavsiyesi veya teknoloji i&#231;g&#246;r&#252;leri olsun, herhangi bir &#351;eye ihtiyac&#305;n&#305;z varsa, size yard&#305;mc&#305; olmak i&#231;in her zaman buraday&#305;z.
</p>


<p style='text-align: justify; font-size: 14px;'>
Samimi olarak,
<br>
Nina Ridgeway
<br>
Biz-Tech-Insights
<br><br>
Not: Ak&#305;ll&#305; i&#231;erik ihtiyac&#305;n&#305;z konusunda bize g&#252;vendi&#287;iniz i&#231;in te&#351;ekk&#252;r ederiz.
</p>
		
		
		


<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br><br>

You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br></p></center>

";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Turkey/Turkish/Secure-and-govern-AI-powered-work-for-your-business/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
