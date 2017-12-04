package routers

import (
	"github.com/astaxie/beego"
	"github.com/xzdbd/squeak-shennongjia/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/env", &controllers.EnvController{})
	beego.Router("/env/chart", &controllers.PollutionChartController{})
}
