<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Kazakhstan/Russian/Dont_Leave-AI-Exposed/asset.pdf";

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



$mail->Subject = '=?UTF-8?B?0KHQv9Cw0YHQuNCx0L4g0LfQsCDQt9Cw0L/RgNC+0YEu?= "=?UTF-8?B?0KPRgdGC0YDQsNC90Y/QudGC0LUg0L3QsNC40LHQvtC70LXQtSDQsNC60YLRg9Cw0LvRjNC90YvQtSDRgNC40YHQutC4INC00LvRjyDQsdC10LfQvtC/0LDRgdC90L7RgdGC0LgsINGB0LLRj9C30LDQvdC90YvQtSDRgSDQmNCYCg==?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>&#1044;&#1086;&#1088;&#1086;&#1075;&#1086;&#1081; <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

&#1041;&#1083;&#1072;&#1075;&#1086;&#1076;&#1072;&#1088;&#1080;&#1084; &#1074;&#1072;&#1089; &#1079;&#1072; &#1080;&#1085;&#1090;&#1077;&#1088;&#1077;&#1089; &#1082; &#1094;&#1077;&#1085;&#1085;&#1086;&#1084;&#1091; &#1082;&#1086;&#1085;&#1090;&#1077;&#1085;&#1090;&#1091; Biz-Tech-Insights, &#1083;&#1102;&#1073;&#1077;&#1079;&#1085;&#1086; &#1087;&#1088;&#1077;&#1076;&#1086;&#1089;&#1090;&#1072;&#1074;&#1083;&#1077;&#1085;&#1085;&#1086;&#1084;&#1091; &#1082;&#1086;&#1084;&#1087;&#1072;&#1085;&#1080;&#1077;&#1081; <b>Microsoft</b>.


</p>
<p style='text-align: justify; font-size: 14px;'>
&#1053;&#1072;&#1078;&#1084;&#1080;&#1090;&#1077;<a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Kazakhstan/Russian/Dont_Leave-AI-Exposed/asset.pdf'> &#1079;&#1076;&#1077;&#1089;&#1100;</a>, &#1095;&#1090;&#1086;&#1073;&#1099; &#1087;&#1086;&#1083;&#1091;&#1095;&#1080;&#1090;&#1100; &#1076;&#1086;&#1089;&#1090;&#1091;&#1087; &#1082; &#1079;&#1072;&#1087;&#1088;&#1086;&#1096;&#1077;&#1085;&#1085;&#1086;&#1084;&#1091; &#1074;&#1072;&#1084;&#1080; &#1082;&#1086;&#1085;&#1090;&#1077;&#1085;&#1090;&#1091;.
</p>


<p style='text-align: justify; font-size: 14px;'>
&#1045;&#1089;&#1083;&#1080; &#1074;&#1072;&#1084; &#1095;&#1090;&#1086;-&#1090;&#1086; &#1085;&#1091;&#1078;&#1085;&#1086;, &#1073;&#1091;&#1076;&#1100; &#1090;&#1086; &#1080;&#1089;&#1089;&#1083;&#1077;&#1076;&#1086;&#1074;&#1072;&#1085;&#1080;&#1077; &#1087;&#1088;&#1086;&#1076;&#1091;&#1082;&#1090;&#1072;, &#1089;&#1086;&#1074;&#1077;&#1090; &#1087;&#1086; &#1087;&#1086;&#1082;&#1091;&#1087;&#1082;&#1077; &#1080;&#1083;&#1080; &#1090;&#1077;&#1093;&#1085;&#1080;&#1095;&#1077;&#1089;&#1082;&#1072;&#1103; &#1080;&#1085;&#1092;&#1086;&#1088;&#1084;&#1072;&#1094;&#1080;&#1103;,
&#1084;&#1099; &#1074;&#1089;&#1077;&#1075;&#1076;&#1072; &#1075;&#1086;&#1090;&#1086;&#1074;&#1099; &#1074;&#1072;&#1084; &#1087;&#1086;&#1084;&#1086;&#1095;&#1100;.

</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>&#1048;&#1089;&#1082;&#1088;&#1077;&#1085;&#1085;&#1077;, <br>Nina Ridgeway<br><span style='color:black;'>Biz-tech Insights<br><br></span></p>

<p style='text-align: justify; font-size: 14px;'>
P.S. &#1057;&#1087;&#1072;&#1089;&#1080;&#1073;&#1086;, &#1095;&#1090;&#1086; &#1076;&#1086;&#1074;&#1077;&#1088;&#1103;&#1077;&#1090;&#1077; &#1085;&#1072;&#1084; &#1089;&#1074;&#1086;&#1102; &#1087;&#1086;&#1090;&#1088;&#1077;&#1073;&#1085;&#1086;&#1089;&#1090;&#1100; &#1074; &#1091;&#1084;&#1085;&#1086;&#1084; &#1082;&#1086;&#1085;&#1090;&#1077;&#1085;&#1090;&#1077;.

</p>
		
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
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Kazakhstan/Russian/Dont_Leave-AI-Exposed/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
