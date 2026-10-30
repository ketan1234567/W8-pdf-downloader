<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);
$ENDURL="";
$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
    "email" => 1,
    "company" => 2,
    "company_size" => 3,
    "job_title" => 4,
   // "job_department" => 5,
    "work_phone" => 6,
    "country" => 7,
    //"CQ" => 9,
    "optin" => 8
];

$mapped_data = [];

foreach ($fields as $key => $value) {
    $mapped_data[$key] = is_numeric($value) ? $_POST["data"][$value] : $_POST[$value];
}

// Store the country value in a variable
$country = $mapped_data["country"];

    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Denmark/Danish/Secure-and-govern-AI-powered-work-for-your-business-SMB/asset.pdf";


// Use the $ENDURL variable as needed



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


$mail->Subject = 'Tak for din anmodning "Sikre AI med tydeligere datakontroller"';

$mail->Body = "<p style='text-align: justify; font-size: 14px;'>K&#230;re <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
Tak for din interesse i det v&#230;rdifulde Biz-Tech-Insights-indhold, venligst leveret af <b>Microsoft</b>.
</p>

<p style='text-align: justify; font-size: 14px;'>
Klik <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Denmark/Danish/Secure-and-govern-AI-powered-work-for-your-business-SMB/asset.pdf'>her</a> for at f&#229; adgang til det &#248;nskede indhold.
</p>
<p style='text-align: justify; font-size: 14px;'>
Hvis du har brug for noget, hvad enten det er produktforskning, k&#248;bsguider eller tekniske indsigter, er vi altid her for at hj&#230;lpe dig.
</p>

<p style='text-align: justify; font-size: 14px;'>
Med venlig hilsen,<br>
Nina Ridgeway<br>
Biz-Tech-Insights
</p>

<p style='text-align: justify; font-size: 14px;'>
P.S. Tak for at stole p&#229; os med dit behov for smart indhold.
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
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Denmark/Danish/Secure-and-govern-AI-powered-work-for-your-business-SMB/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
