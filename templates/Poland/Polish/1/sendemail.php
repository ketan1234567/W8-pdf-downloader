<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Poland/Polish/Dont-Leave-AI-Exposed_ENT/asset.pdf";

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
    //"CQ1" => 9,
	"optin" => 8
   
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


$mail->Subject = '=?UTF-8?B?RHppxJlrdWplbXkgemEgemFweXRhbmll?= "=?UTF-8?B?T2Rwb3dpZWR6IG5hIG5hanBpbG5pZWpzemUgemFncm/FvGVuaWEgYmV6cGllY3plxYRzdHdhIEFJIGp1xbwgZHppxZsK?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Droga <b>$firstname</b>,</p>

<p style='text-align: justify; font-size: 14px;'>

Dzi&#281;kujemy za zainteresowanie warto&#347;ciowymi tre&#347;ciami Biz-Tech-Insights, udost&#281;pnionymi przez firm&#281; <b>Microsoft</b>.

</p>
<p style='text-align: justify; font-size: 14px;'>
Trzask <a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Poland/Polish/Dont-Leave-AI-Exposed_ENT/asset.pdf'> Tutaj </a> aby uzyska&#263; dost&#281;p do &#380;&#261;danej tre&#347;ci.
</p>


<p style='text-align: justify; font-size: 14px;'>

Je&#347;li potrzebujesz czegokolwiek, niezale&#380;nie od tego, czy chodzi o badania produkt&#243;w, porady zakupowe czy informacje techniczne, zawsze jeste&#347;my gotowi Ci pom&#243;c.
</p>
		
		
		
<p style='text-align: justify; font-size: 14px;'>Z powa&#380;aniem,<br>Nina Ridgeway<br><span style='color:black'>Biz-tech Insights<br><br></span></p>


<p style='text-align: justify; font-size: 14px;'>

P.S. Dzi&#281;kujemy za zaufanie i powierzenie nam inteligentnych tre&#347;ci.
</p>



<center><p style='text-align: center; font-size: 14px;'>Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br>You received this email because you signed up for content from Biz-Tech-Insights.<br>You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br></p></center>



";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo 'Message has been sent successfully';
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Poland/Polish/Dont-Leave-AI-Exposed_ENT/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}


?>
