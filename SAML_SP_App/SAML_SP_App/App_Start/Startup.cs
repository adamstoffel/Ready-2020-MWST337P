using System;
using System.Configuration;
using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.Owin;
using Microsoft.Owin.Logging;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Owin;
using Sustainsys.Saml2;
using Sustainsys.Saml2.Configuration;
using Sustainsys.Saml2.Metadata;
using Sustainsys.Saml2.Owin;

[assembly: OwinStartup(typeof(SAML_SP_App.App_Start.Startup))]

namespace SAML_SP_App.App_Start
{
    public class Startup
    {
        private static string IdpEntityId = ConfigurationManager.AppSettings["IdpEntityId"];
        private static string IdpMetadataUrl = ConfigurationManager.AppSettings["IdpMetadataUrl"];
        private static string SiteBaseUrl = ConfigurationManager.AppSettings["SiteBaseUrl"];
        private static string SigningCertThumbprint = ConfigurationManager.AppSettings["SigningCertThumbprint"];

        public void Configuration(IAppBuilder app)
        {
#if DEBUG
            app.SetLoggerFactory(new ConsoleLogger.Factory());
#endif

            app.Use((IOwinContext owinContext, Func<Task> next) =>
            {
                owinContext.Environment.Add("saml2.idp", new EntityId(IdpEntityId));
                return next.Invoke();
            });

            app.SetDefaultSignInAsAuthenticationType("SamlCookie");
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = "SamlCookie"
            });
            app.UseSaml2Authentication(GetSaml2AuthenticationOptions());
        }

        private static Saml2AuthenticationOptions GetSaml2AuthenticationOptions()
        {
            var spOptions = CreateSPOptions();
            var saml2Options = new Saml2AuthenticationOptions(false)
            {
                SPOptions = spOptions
            };

            var idp = new IdentityProvider(new EntityId(IdpEntityId), spOptions)
            {
                MetadataLocation = IdpMetadataUrl
            };
            idp.LoadMetadata = true;

            saml2Options.IdentityProviders.Add(idp);

            return saml2Options;
        }

        private static SPOptions CreateSPOptions()
        {
            var organization = new Organization();
            organization.Names.Add(new LocalizedName("Contoso Adventures", "en"));
            organization.DisplayNames.Add(new LocalizedName("Contoso Adventures", "en"));
            organization.Urls.Add(new LocalizedUri(new Uri(SiteBaseUrl), "en"));

            var spOptions = new SPOptions
            {
                EntityId = new EntityId(SiteBaseUrl + "/Saml2"),
                ReturnUrl = new Uri(SiteBaseUrl + "/Confirmed"),
                DiscoveryServiceUrl = new Uri(SiteBaseUrl + "/DiscoveryService"),
                Organization = organization,
                MinIncomingSigningAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
            };

            using (var certStore = new X509Store(StoreName.My, StoreLocation.CurrentUser))
            {
                certStore.Open(OpenFlags.ReadOnly);
                var certs = certStore.Certificates
                    .Find(X509FindType.FindByThumbprint, SigningCertThumbprint, false);

                spOptions.ServiceCertificates.Add(new ServiceCertificate
                {
                    Certificate = certs[0],
                    Use = CertificateUse.Signing,
                    Status = CertificateStatus.Current
                });
            }

            return spOptions;
        }
    }

    internal class ConsoleLogger : ILogger {
        public bool WriteCore(TraceEventType eventType, int eventId, object state, Exception exception, Func<object, Exception, string> formatter)
        {
            Console.WriteLine(formatter(state, exception));
            return true;
        }

        public class Factory : ILoggerFactory
        {
            public ILogger Create(string name)
            {
                return new ConsoleLogger();
            }

        }
    }
}
