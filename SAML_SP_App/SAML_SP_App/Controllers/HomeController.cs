using System.Security.Claims;
using System.Web;
using System.Web.Mvc;

namespace SAML_SP_App.Controllers
{
    public class HomeController : Controller
    {
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

        [SamlAuthorize]
        public ActionResult Confirmed()
        {
            if (User is ClaimsPrincipal principal)
            {
                ViewBag.UserName = principal.FindFirst(ClaimTypes.Name)?.Value;
                ViewBag.UserEmail = principal.FindFirst(ClaimTypes.Email)?.Value;
            }
            return View();
        }

        [SamlAuthorize]
        public ActionResult Logout()
        {
            if  (User?.Identity?.IsAuthenticated == true) {
                HttpContext.GetOwinContext().Authentication.SignOut();
            }
            return Redirect("Index");
        }
    }

    public class SamlAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.HttpContext.GetOwinContext().Authentication.Challenge("Saml2");
        }
    }
}