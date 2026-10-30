<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Czechia/Czech/Dont_Leave-AI-Exposed/asset.pdf";

$fields = [
"firstname" => "firstname",
"lastname" => 0,
"email" => 1,
"company" => 2,
"company_size" => 3,
//"job_role" => 4,
//"job_department" => 5,
"job_title" => 10,
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



$mail->Subject = '=?UTF-8?B?ZMSba3VqZW1lIHphIMW+w6Fkb3N0?= "=?UTF-8?B?VsSbbnVqdGUgc2Ugc291xI1hc27DvW0gbmVqcGFsxI1pdsSbasWhw61tIGJlenBlxI1ub3N0bsOtbSByaXppa8WvbSBBSQo=?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Mil&#253; <b>$firstname</b>,</p>




<p style='text-align: justify; font-size: 14px;'>

D&#283;kujeme za v&#225;&#353; z&#225;jem o cenn&#253; obsah Biz-Tech-Insights, s laskav&#253;m svolen&#237;m <b>Microsoft</b>. 
</p>
<p style='text-align: justify; font-size: 14px;'>
Klikn&#283;te <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Czechia/Czech/Dont_Leave-AI-Exposed/asset.pdf'> zde</a> pro p&#345;&#237;stup k po&#382;adovan&#233;mu obsahu.<br><br>Pokud cokoli pot&#345;ebujete, a&#357; u&#382; je to pr&#367;zkum produktu, poradenstv&#237; s n&#225;kupem nebo technick&#233; poznatky, jsme tu v&#382;dy, abychom v&#225;m pomohli.
</p>


  
<p style='text-align: justify; font-size: 14px;'>Sincerely,<br>
Nina Ridgeway<br><span style='color:black;'>Biz-Tech-Insights<br><br></span>P.S. D&#283;kujeme, &#382;e jste n&#225;m sv&#283;&#345;ili svou pot&#345;ebu chytr&#233;ho obsahu.<br></p>

 


		
<center><p style='text-align: center; font-size: 14px;'>
Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104
<br>
You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.
<br></p></center>


";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Czechia/Czech/Dont_Leave-AI-Exposed/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
