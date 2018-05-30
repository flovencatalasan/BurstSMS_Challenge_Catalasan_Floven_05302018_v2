using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Net.Http;
using System.Net;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using BurstSMS_Challenge_Catalasan_Floven_05302018.Extensions;
using Newtonsoft.Json.Linq;

namespace BurstSMS_Challenge_Catalasan_Floven_05302018.Helpers
{
    public class HttpClientRequest
    {
        public class ResponseMessage
        {
            public HttpStatusCode StatusCode { get; set; }
            public string Content { get; set; }
        }

        public class RequestOptions
        {
            public string RequestBody { get; set; }
            public string BaseAddress { get; set; }
            public string ResourceURL { get; set; }
            public bool UseProxy { get; set; }
        }

        public async Task<ResponseMessage> GetAPIResponse(RequestOptions options, bool IsPostMethod = true)
        {
            //string proxyUri = string.Format("{0}:{1}", "http://10.80.128.60", 8080);

            //var proxyCred = new NetworkCredential()
            //{
            //    Domain = "cebupacificair.com",
            //    UserName = "fccfloven",
            //    Password = "121215"
            //};

            //var proxy = new WebProxy(proxyUri)
            //{
            //    UseDefaultCredentials = false,
            //    Credentials = proxyCred
            //};

            using (HttpClient client = new HttpClient(new HttpClientHandler()
            {
                PreAuthenticate = true,
                UseDefaultCredentials = true,
                UseProxy = false
            }))
            {
                var apiKey = Environment.GetEnvironmentVariable("SMS_API_KEY");
                var apiSecret = Environment.GetEnvironmentVariable("SMS_API_SECRET");
                var apiBaseAddress = Environment.GetEnvironmentVariable("SMS_API_URL");

                client.BaseAddress = new Uri(apiBaseAddress);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));

                var byteArray = Encoding.ASCII.GetBytes(string.Format("{0}:{1}", apiKey, apiSecret));

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

                var formData = new FormUrlEncodedContent(JsonConvert.DeserializeObject<Dictionary<string, string>>(options.RequestBody));

                try
                {
                    var response = IsPostMethod ? client.PostAsync(options.ResourceURL, formData).Result : client.GetAsync(options.ResourceURL + JsonToQueryString(options.RequestBody)).Result;
                    var content = await response.Content.ReadAsStringAsync();

                    client.Dispose();

                    return new ResponseMessage()
                    {
                        StatusCode = response.StatusCode,
                        Content = content
                    };
                }
                catch (Exception ex)
                {
                    var exceptionMessages = String.Join(Environment.NewLine, ex.GetInnerExceptions().Select(e => e.Message));

                    return new ResponseMessage()
                    {
                        StatusCode = HttpStatusCode.InternalServerError,
                        Content = JsonConvert.SerializeObject(new { ExceptionMessage = exceptionMessages })
                    };
                }

            }
        }

        string JsonToQueryString(string json)
        {
            var jObj = (JObject)JsonConvert.DeserializeObject(json);

            var query = String.Join("&",
                            jObj.Children().Cast<JProperty>()
                            .Select(jp => jp.Name + "=" + WebUtility.UrlEncode(jp.Value.ToString())));
            return query;
        }
    }

    internal class WebProxy : IWebProxy
    {
        private Uri ProxyUri;

        public WebProxy(string proxyUri)
        {
            this.ProxyUri = new Uri(proxyUri);
        }

        public WebProxy(Uri proxyUri)
        {
            this.ProxyUri = proxyUri;
        }

        public Uri GetProxy(Uri destination)
        {
            return this.ProxyUri;
        }

        public bool IsBypassed(Uri host)
        {
            return false;
        }

        public ICredentials Credentials { get; set; }

        public bool UseDefaultCredentials { get; set; }

    }
}