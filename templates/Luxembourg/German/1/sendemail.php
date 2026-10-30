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

    "CQ" => 9,
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
    
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Luxembourg/German/From-Systems-of-Record-to-Systems-of-Action-video/thankyou_1.html";
	
} else {
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Luxembourg/German/From-Systems-of-Record-to-Systems-of-Action-video/thanks.html";
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


$mail->Subject = '=?UTF-8?B?VmllbGVuIERhbmsgZsO8ciBJaHJlIEFuZnJhZ2Uu?= "=?UTF-8?B?Vm9uIGtsYXNzaXNjaGVuIEF1ZnplaWNobnVuZ3NzeXN0ZW1lbiB6dSBTeXN0ZW1lbiwgZGllIGFrdGl2IG1pdCBJaG5lbiB6dXNhbW1lbmFyYmVpdGVuLCB1bSBBdWZnYWJlbiBhdXN6dWbDvGhyZW4=?="';
$mail->Body = "

<p style='text-align: justify; font-size: 14px;'>Liebling <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

    Vielen Dank f&#252;r Ihr aktuelles Interesse an <strong>\"Von klassischen Aufzeichnungssystemen zu Systemen, die aktiv mit Ihnen zusammenarbeiten, um Aufgaben auszuf&#252;hren\"</strong> von Biz Tech Insights &#8211; Content im Namen von <strong>Microsoft.</strong> Indem Sie auf den Link klicken, best&#228;tigen Sie Ihr Einverst&#228;ndnis damit, dass Microsoft mich bez&#252;glich kommerzieller Informationen kontaktiert.	
    </p>
    <p style='text-align: justify; font-size: 14px;'>
     <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Luxembourg/German/From-Systems-of-Record-to-Systems-of-Action-video/thanks.html'>
	 Klicken Sie hier, um auf den Inhalt zuzugreifen.</a>
    </p>
    
    
    <p style='text-align: justify; font-size: 14px;'>
    Wir legen Wert auf Ihre Privatsph&#228;re und versichern Ihnen, dass Ihre Daten mit gr&#246;&#223;ter Sorgfalt und unter strikter Einhaltung der Datenschutzbestimmungen behandelt werden. Sie k&#246;nnen sich jederzeit abmelden.
    </p>
    
    <p style='text-align: justify; font-size: 14px;'>
        Bei Biz Tech Insights sind wir stolz auf die Beziehung, die wir mit Technologen wie Ihnen gepflegt haben. Vielen Dank, dass Sie uns Ihre Herausforderungen und Ziele anvertrauen. Wir freuen uns darauf, Sie weiterhin betreuen zu d&#252;rfen.
    </p>
    
    <p style='text-align: justify; font-size: 14px;'>
    Beste gr&#252;&#223;e,
    </p>	
		
<p style='text-align: justify; font-size: 14px;'>Nina Ridgeway<br><span style='color:black'>Biz-tech Insights<br><br></span></p>

<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104
<br>You received this email because you signed up to receive content from Biz Tech Insights.<br>You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br></p></center>



";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = '$ENDURL';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
