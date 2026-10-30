<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Angola/Portuguese/VMware-to-Azure-Choosing-the-right-destination-for-your-workloads/asset.pdf";

$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
    "email" => 1,
	"company" => 2,
	"company_size" => 3,
	//"job_role" => 4,
	//"job_department" => 5,
	"work_phone" => 6,
    "country" => 7,
    "job_title" => 8,
    "cq1" => 9,
    "optin1" => 23
//"optin2" => 24
   
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


$mail->Subject = 'Obrigado por solicitar "=?UTF-8?B?Vk13YXJlIHBhcmEgQXp1cmU6IEVzY29saGVyIG8gZGVzdGlubyBjZXJ0byBwYXJhIGFzIHN1YXMgd29ya2xvYWRz?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>querida <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>
Agradecemos seu interesse no valioso conte&#250;do do Biz-Tech-Insights, cortesia da <b>Microsoft</b>.
</p>

<p style='text-align: justify; font-size: 14px;'>
Clique <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Angola/Portuguese/VMware-to-Azure-Choosing-the-right-destination-for-your-workloads/asset.pdf'>aqui</a> para acessar o conte&#250;do solicitado.
</p>
<p style='text-align: justify; font-size: 14px;'>
Se precisar de alguma coisa, seja pesquisa de produto, dicas de compra ou insights sobre tecnologia, estamos sempre aqui para ajudar.
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>
Sinceramente,<br>
Nina Ridgeway<br>
Biz-Tech-Insights
</p>
<p style='text-align: justify; font-size: 14px;'>
P.S.: Obrigado por confiar em n&#243;s para atender &#224; sua necessidade de conte&#250;do inteligente.
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
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Angola/Portuguese/VMware-to-Azure-Choosing-the-right-destination-for-your-workloads/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
