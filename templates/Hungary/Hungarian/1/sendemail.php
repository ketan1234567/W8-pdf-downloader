<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Hungary/Hungarian/Dont-Leave-AI-Exposed_ENT/asset.pdf";

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
// "cq1" => 9,
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


$mail->Subject = '=?UTF-8?B?S8O2c3rDtm5qw7xrIGvDqXLDqXPDqXQ=?= "=?UTF-8?B?S2V6ZWxqZSBheiBBSSBqZWxlbmxlZ2kgbGVnw6lnZXTFkWJiIGJpenRvbnPDoWdpIGtvY2vDoXphdGFpdAo=?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Kedves <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
K&#246;sz&#246;nj&#252;k &#233;rdekl&#337;d&#233;s&#233;t az &#233;rt&#233;kes Biz-Tech-Insights tartalom ir&#225;nt, a <b>Microsoft</b> j&#243;volt&#225;b&#243;l.
</p>
<p style='text-align: justify; font-size: 14px;'>
Kattintson <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Hungary/Hungarian/Dont-Leave-AI-Exposed_ENT/asset.pdf'> ide</a> a k&#233;rt tartalom el&#233;r&#233;s&#233;hez.
</p>


<p style='text-align: justify; font-size: 14px;'>

Ha b&#225;rmire sz&#252;ks&#233;ge van, legyen sz&#243; term&#233;kkutat&#225;sr&#243;l, v&#225;s&#225;rl&#225;si tan&#225;csad&#225;sr&#243;l vagy technikai inform&#225;ci&#243;kr&#243;l, mindig itt vagyunk, hogy seg&#237;ts&#252;nk.
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>Sincerely, <br>Nina Ridgeway<br><span style='color:black'>Biz-tech Insights<br><br></span></p>

<p style='text-align: justify; font-size: 14px;'>
Ui.: K&#246;sz&#246;nj&#252;k, hogy r&#225;nk b&#237;ztad az intelligens tartalom ir&#225;nti ig&#233;nyedet.
</p>

<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br>You received this email because you signed up for content from Biz-Tech-Insights.<br>You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed'>here</a> to unsubscribe.<br></p></center>



";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Hungary/Hungarian/Dont-Leave-AI-Exposed_ENT/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
