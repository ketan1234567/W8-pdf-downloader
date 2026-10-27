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
    // "job_role" => 4,
    // "job_department" => 5,
    "job_title" => 5,
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

    
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Finland/Finnish/Inside-Agentic-Service-Elevating-the-Customer-Experience-with-AI-Agents/asset.pdf";


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

                     
$mail->From = "campaign@engage.biz-tech-insights.com";
$mail->FromName = "Biz-Tech-Insights";
$mail->addAddress($email, $firstname);

$mail->isHTML(true);


$mail->Subject = '=?UTF-8?B?S2lpdG9zIHB5eW5uw7ZzdMOkc2k=?= "=?UTF-8?B?QXNpYWthc2tva2VtdWtzZW4ga29oZW50YW1pbmVuIHRla2/DpGx5YWdlbnRlaWxsYQ==?="';

$mail->Body = "
<p style='text-align: justify; font-size: 14px;'>
Hyv&#228; <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
Kiitos kiinnostuksestasi arvokasta Biz-Tech-Insights-sis&#228;lt&#246;&#228; kohtaan, jonka tarjoaa <b>Microsoft</b>.
</p>

<p style='text-align: justify; font-size: 14px;'>
Napsauta <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Finland/Finnish/Inside-Agentic-Service-Elevating-the-Customer-Experience-with-AI-Agents/asset.pdf'>t&#228;t&#228;</a> p&#228;&#228;st&#228;ksesi pyyt&#228;m&#228;&#228;si sis&#228;lt&#246;&#246;n.
</p>

<p style='text-align: justify; font-size: 14px;'>
Jos tarvitset mit&#228; tahansa, olipa kyseess&#228; sitten tuotetutkimus, osto-ohjeet tai tekniset n&#228;kemykset, olemme aina t&#228;&#228;ll&#228; auttaaksemme sinua.
</p>

<p style='text-align: justify; font-size: 14px;'>
Yst&#228;v&#228;llisin terveisin,<br>
Nina Ridgeway<br>
Biz-Tech-Insights
</p>

<p style='text-align: justify; font-size: 14px;'>
P.S. Kiitos, ett&#228; luotat meihin &#228;lykk&#228;&#228;n sis&#228;ll&#246;n tarpeessasi.
</p>

<center><p style='text-align: center; font-size: 14px;'>
Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br>
You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe. 

</p></center>



";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Finland/Finnish/Inside-Agentic-Service-Elevating-the-Customer-Experience-with-AI-Agents/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
