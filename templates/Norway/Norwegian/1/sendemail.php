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
	"job_title" => 5,
    //"job_role" => 4,
    //"job_department" => 5,
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

if (strcmp($country, "DE") == 0 ||
    strcmp($country, "AT") == 0 ||
    strcmp($country, "LU") == 0 ||
    strcmp($country, "NO") == 0 ||
    strcmp($country, "GR") == 0 ||
    strcmp($country, "CH") == 0) {
    
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Norway/Norwegian/Dont-Leave-AI-Exposed/thankyou_1.html";
} else {
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Norway/Norwegian/Dont-Leave-AI-Exposed/asset.pdf";
}

// Use the $ENDURL variable as needed



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

$mail->Subject = '=?UTF-8?B?VGFrayBmb3IgZm9yZXNww7hyc2VsZW4=?= "=?UTF-8?B?SMOlbmR0ZXIgZGFnZW5zIG1lc3QgcHJlc3NlcmVuZGUgS0ktc2lra2VyaGV0c3Jpc2lrb2Vy?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Kj&#230;re <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

Takk for din n&#229;v&#230;rende interesse for <strong>H&#229;ndter dagens mest presserende KI-sikkerhetsrisikoer
</strong> av Biz Tech Insights- Content p&#229; vegne fra <strong>Microsoft.</strong> Ved &#229; klikke p&#229; koblingen bekrefter du at du godtar at Microsoft kontakter meg ang&#229;ende kommersiell informasjon.
</p>
<p style='text-align: justify; font-size: 14px;'>
 <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Norway/Norwegian/Dont-Leave-AI-Exposed/asset.pdf'>klikk her for &#229; f&#229; tilgang til innholdet</a>.
</p>


<p style='text-align: justify; font-size: 14px;'>
Vi verdsetter personvernet ditt og forsikrer deg om at informasjonen din vil bli behandlet med st&#248;rste forsiktighet og i streng overholdelse av databeskyttelsesbestemmelsene. Du kan melde deg av n&#229;r som helst.
</p>

<p style='text-align: justify; font-size: 14px;'>
Hos Biz Tech Insights er vi stolte av forholdet vi har pleiet med teknologer som deg. Takk for at du betrodde oss dine utfordringer og m&#229;l. Vi ser frem til &#229; fortsette &#229; betjene deg.
</p>

<p style='text-align: justify; font-size: 14px;'>
Med vennlig hilsen,
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>Nina Ridgeway<br><span style='color:black;'>Biz-tech Insights<br><br></span></p>

<center><p style='text-align: center; font-size: 14px;'>
Biz-Tech-Insights 300 California Street, Suite 200 San Francisco, CA 94104.
 <br>You received this email because you signed up to receive content from Biz Tech Insights.<br>You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br></p></center>



";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = '$ENDURL';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
