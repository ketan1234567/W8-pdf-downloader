<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);


$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Libya/Arabic/Regulatory-Readiness-for-Trusted-and-Secure-AI-Adoption/asset.pdf";

$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
    "email" => 1,
	"company" => 2,
	"company_size" => 3,
	 "job_title"=>10,
	//"job_role" => 4,
	//"job_department" => 5,
	"work_phone" => 6,
    "country" => 7,
	// "cq1" => 8,
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



$mail->Subject = '=?UTF-8?B?2LTZg9ix2Kcg2YTYt9mE2KjZgw==?= "=?UTF-8?B?2KjYsdmH2YYg2LnZhNmJINin2YTYsNmD2KfYoSDYp9mE2KfYtdi32YbYp9i52Yog2KfZhNmF2YjYq9mI2YIg2KjZg9mEINir2YLYqQ==?="';


$mail->Body = "<p style='text-align: justify; font-size: 14px;'>&#1593;&#1586;&#1610;&#1586;&#1610; <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
&#1606;&#1588;&#1603;&#1585;&#1603; &#1593;&#1604;&#1609; &#1575;&#1607;&#1578;&#1605;&#1575;&#1605;&#1603; &#1576;&#1605;&#1581;&#1578;&#1608;&#1609; Biz-Tech-Insights &#1575;&#1604;&#1602;&#1610;&#1605;&#1548; &#1605;&#1602;&#1583;&#1605;&#1577; &#1605;&#1606; <b>&#1605;&#1575;&#1610;&#1603;&#1585;&#1608;&#1587;&#1608;&#1601;&#1578;</b>.

</p>
<p style='text-align: justify; font-size: 14px;'>
&#1575;&#1606;&#1602;&#1585; <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Libya/Arabic/Regulatory-Readiness-for-Trusted-and-Secure-AI-Adoption/asset.pdf'> &#1607;&#1606;&#1575;</a> &#1604;&#1604;&#1608;&#1589;&#1608;&#1604; &#1573;&#1604;&#1609; &#1575;&#1604;&#1605;&#1581;&#1578;&#1608;&#1609; &#1575;&#1604;&#1605;&#1591;&#1604;&#1608;&#1576;.
</p>


<p style='text-align: justify; font-size: 14px;'>
&#1573;&#1584;&#1575; &#1603;&#1606;&#1578; &#1576;&#1581;&#1575;&#1580;&#1577; &#1573;&#1604;&#1609; &#1571;&#1610; &#1588;&#1610;&#1569;&#1548; &#1587;&#1608;&#1575;&#1569; it&#8217;s &#1587;&#1608;&#1575;&#1569; &#1603;&#1606;&#1578; &#1578;&#1576;&#1581;&#1579; &#1593;&#1606; &#1576;&#1581;&#1579; &#1593;&#1606; &#1605;&#1606;&#1578;&#1580; &#1571;&#1608; &#1606;&#1589;&#1575;&#1574;&#1581; &#1588;&#1585;&#1575;&#1569; &#1571;&#1608; &#1585;&#1572;&#1609; &#1578;&#1602;&#1606;&#1610;&#1577;&#1548; &#1601;&#1606;&#1581;&#1606; &#1607;&#1606;&#1575; &#1583;&#1575;&#1574;&#1605;&#1611;&#1575; &#1604;&#1605;&#1587;&#1575;&#1593;&#1583;&#1578;&#1603;.
</p>


<p style='text-align: justify; font-size: 14px;'>
&#1576;&#1573;&#1582;&#1604;&#1575;&#1589;,
<br>
Nina Ridgeway
<br>
Biz-Tech-Insights
<br><br>
&#1605;&#1604;&#1575;&#1581;&#1592;&#1577;: &#1606;&#1588;&#1603;&#1585;&#1603; &#1593;&#1604;&#1609; &#1579;&#1602;&#1578;&#1603; &#1576;&#1606;&#1575; &#1601;&#1610; &#1578;&#1604;&#1576;&#1610;&#1577; &#1575;&#1581;&#1578;&#1610;&#1575;&#1580;&#1575;&#1578;&#1603; &#1605;&#1606; &#1575;&#1604;&#1605;&#1581;&#1578;&#1608;&#1609; &#1575;&#1604;&#1584;&#1603;&#1610;.
</p>
	

<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br><br>

You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br></p></center>

";
$mail->AltBody = "";


try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Libya/Arabic/Regulatory-Readiness-for-Trusted-and-Secure-AI-Adoption/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
