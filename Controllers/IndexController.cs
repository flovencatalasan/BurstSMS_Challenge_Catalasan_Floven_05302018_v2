using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BurstSMS_Challenge_Catalasan_Floven_05302018.Helpers;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace BurstSMS_Challenge_Catalasan_Floven_05302018.Controllers
{
    public class IndexController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

            return View();
        }
    }

    [Route("api/[controller]")]
    public class SMSController : Controller
    {
        [HttpPost]
        public async Task<HttpClientRequest.ResponseMessage> Submit([FromBody]JObject request)
        {
            var options = new HttpClientRequest.RequestOptions()
            {
                RequestBody = JsonConvert.SerializeObject(request),
                ResourceURL = "send-sms.json"
            };

            var response = await new HttpClientRequest().GetAPIResponse(options);

            return response;
        }
    }
}
