<?php
include('../../../../../mailer_config/mailerConfig.php');   
require "../../../../../DataCurlNodeApi/DataCurlNodeApiFunctions.php";


//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$ENDURL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Japan/Japanese/Never-Trust-Always-Verify-The-Zero-Trust-Guide-for-Your-Business/asset.pdf";

$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
    "email" => 1,
	"company" => 2,
	"company_size" => 3,
	"job_Title" => 5,
	// "job_department" => 5,
	"work_phone" => 6,
    "country" => 7,
   // "CQ" => 9,
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


$mail->Subject = '=?UTF-8?B?44Oq44Kv44Ko44K544OI44GX44Gm44GE44Gf44Gg44GN44GC44KK44GM44Go44GG44GU44GW44GE44G+44GZ?= "=?UTF-8?B?44K844OtIOODiOODqeOCueODiOOBruOCouODl+ODreODvOODgeOBp+aIkOmVt+OCkue2muOBkeOCi+ODk+OCuOODjeOCueOCkuS/neitt+OBmeOCiw==?="';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>
<b>$firstname</b> &#27096;</p>

<p style='text-align: justify; font-size: 14px;'>
<b>Microsoft</b> &#12364;&#25552;&#20379;&#12377;&#12427;&#20385;&#20516;&#12354;&#12427; Biz-Tech-Insights &#12467;&#12531;&#12486;&#12531;&#12484;&#12395;&#12372;&#33288;&#21619;&#12434;&#12362;&#25345;&#12385;&#12356;&#12383;&#12384;&#12365;&#12289;&#12354;&#12426;&#12364;&#12392;&#12358;&#12372;&#12374;&#12356;&#12414;&#12377;&#12290;
</p>

<p style='text-align: justify; font-size: 14px;'>
&#12372;&#24076;&#26395;&#12398;&#12467;&#12531;&#12486;&#12531;&#12484;&#12395;&#12450;&#12463;&#12475;&#12473;&#12377;&#12427;&#12395;&#12399;&#12289;<a href='https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Japan/Japanese/Never-Trust-Always-Verify-The-Zero-Trust-Guide-for-Your-Business/asset.pdf'>&#12371;&#12385;&#12425;</a>&#12434;&#12463;&#12522;&#12483;&#12463;&#12375;&#12390;&#12367;&#12384;&#12373;&#12356;&#12290;
</p>

<p style='text-align: justify; font-size: 14px;'>
&#35069;&#21697;&#12522;&#12469;&#12540;&#12481;&#12289;&#36092;&#20837;&#12450;&#12489;&#12496;&#12452;&#12473;&#12289;&#12486;&#12463;&#12494;&#12525;&#12472;&#12540;&#12395;&#38306;&#12377;&#12427;&#27934;&#23519;&#12394;&#12393;&#12289;&#20309;&#12363;&#12372;&#35201;&#26395;&#12364;&#12372;&#12374;&#12356;&#12414;&#12375;&#12383;&#12425;&#12289;&#12356;&#12388;&#12391;&#12418;&#12362;&#27671;&#36605;&#12395;&#12362;&#21839;&#12356;&#21512;&#12431;&#12379;&#12367;&#12384;&#12373;&#12356;&#12290;
</p>

<p style='text-align: justify; font-size: 14px;'>
&#25964;&#20855;<br>
&#12491;&#12540;&#12490;&#12539;&#12522;&#12483;&#12472;&#12454;&#12455;&#12452;<br>
&#12499;&#12472;&#12493;&#12473;&#12539;&#12486;&#12463;&#12494;&#12525;&#12472;&#12540;&#12539;&#12452;&#12531;&#12469;&#12452;&#12488;
</p>

<p style='text-align: justify; font-size: 14px;'>
&#36861;&#20280;&#65306;&#12473;&#12510;&#12540;&#12488;&#12467;&#12531;&#12486;&#12531;&#12484;&#12398;&#12491;&#12540;&#12474;&#12434;&#24403;&#31038;&#12395;&#12372;&#20381;&#38972;&#12356;&#12383;&#12384;&#12365;&#12289;&#12354;&#12426;&#12364;&#12392;&#12358;&#12372;&#12374;&#12356;&#12414;&#12377;&#12290;
</p>


		
		
<center><p style='text-align: center; font-size: 14px;'>
Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104<br>

You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.<br>

</p></center>





";
$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2/Japan/Japanese/Never-Trust-Always-Verify-The-Zero-Trust-Guide-for-Your-Business/asset.pdf';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
