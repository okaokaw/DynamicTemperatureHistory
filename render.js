
//----------------数据获取
var num = 17;
var data = [];
// 32 33 34 
for (let i = 2018; i > (2018 - num); i-- ) {

	let xhr = new XMLHttpRequest();
	xhr.open("GET", `./year_day_json/year_json_${i}.json`,false);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {

			var data_json = JSON.parse(xhr.responseText); //JSON文本转为JS对象	
			//console.log(data_json);

			//var datekey = "date" + i;
			var datekey = "date";

			var tempkey = "temp" + i;

			if (i == 2018) {
			for (var k = 0; k < 366; k++) {
	  			//console.log(data);
	  			data.push({ [datekey]: new Date("2018" + data_json[k].date.slice(4)), [tempkey]: data_json[k].temp});
			}	
			}
			else {
				for (var k = 0; k < 365; k++) {
				data[k][tempkey] = data_json[k].temp;
			}
			}

		}
	};
	xhr.send(null); // 发送 XHR AJAX 请求
}


//----------------创建图表


am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);


// Create chart
var chart = am4core.create("chartdiv", am4charts.XYChart);


chart.data = data;
//console.log(data);


// year slider
var startYear = 2002;
var endYear = 2017;
var currentYear = 2002;

//2018 
var dateAxis =  new Array(num);
for (var i = 0; i < num; i++) {
	dateAxis[i] = chart.xAxes.push(new am4charts.DateAxis());
	dateAxis[i].renderer.grid.template.location = 0;
	dateAxis[i].renderer.labels.template.disabled = true;
	dateAxis[i].renderer.grid.template.strokeOpacity = 0;
}
dateAxis[0].renderer.labels.template.fill = am4core.color("gray");
dateAxis[0].renderer.labels.template.disabled = false;


var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.grid.template.location = 0;
valueAxis.renderer.labels.template.fill = am4core.color("gray");
valueAxis.renderer.minWidth = 60;
valueAxis.renderer.grid.template.strokeOpacity = 0.07;

var series1 = chart.series.push(new am4charts.LineSeries());
series1.name = "2018";
series1.dataFields.dateX = "date";
series1.dataFields.valueY = "temp2018";
series1.yAxis = valueAxis;
series1.xAxis = dateAxis[0];
series1.tooltipText = "{dateX}: [bold]{valueY.value}[/]";
series1.fill = am4core.color("#e59165");
series1.stroke = am4core.color("#e59165");
series1.strokeWidth = 1.5;
series1.tensionX = 0.9;

//最高最低温线
var range0 = valueAxis.axisRanges.create();
range0.value = 36;
range0.grid.stroke = am4core.color("#E6828C");
range0.grid.strokeDasharray = (10,10);
range0.grid.strokeWidth = 2;
range0.grid.strokeOpacity = 0.6;
range0.label.inside = true;
range0.label.fill = range0.grid.stroke;
range0.label.verticalCenter = "bottom";

var range00 = valueAxis.axisRanges.create();
range00.value = 2;
range00.grid.stroke = am4core.color("#75BFCE");
range00.grid.strokeDasharray = (10,10);
range00.grid.strokeWidth = 2;
range00.grid.strokeOpacity = 0.6;
range00.label.inside = true;
range00.label.fill = range00.grid.stroke;
range00.label.verticalCenter = "bottom";



//another year

var series2 = chart.series.push(new am4charts.LineSeries());

series2.name = startYear + "";
series2.dataFields.dateX = "date";
series2.dataFields.valueY = "temp" + series2.name;
series2.yAxis = valueAxis;
series2.xAxis = dateAxis[0];
series2.tooltipText = "{name}：[bold]{valueY.value}[/]";
series2.fill = am4core.color("#87D2D7");
series2.stroke = am4core.color("#87D2D7");
series2.strokeOpacity = 1 - 0.15;
series2.strokeWidth = 1;
series2.tensionX = 0.9;

var max = -50;
var min = 99;
for (var i in data) {
	var t = data[i]['temp' + series2.name];
	if (t > max) {
		max = t;
	}
	if (t < min) {
		min = t;
	}
}

// maxium value guide
var range = valueAxis.axisRanges.create();
range.value = max;
range.grid.stroke = am4core.color("#E6828C");
range.grid.strokeWidth = 2;
range.grid.strokeOpacity = 0.6;
range.label.inside = true;
range.label.text = "最高温度 " + max;
range.label.fill = range.grid.stroke;
range.label.verticalCenter = "bottom";
var range2 = valueAxis.axisRanges.create();
range2.value = min;
range2.grid.stroke = am4core.color("#75BFCE");
range2.grid.strokeWidth = 2;
range2.grid.strokeOpacity = 0.6;
range2.label.inside = true;
range2.label.text = "最低温度 " + min;
range2.label.fill = range2.grid.stroke;
range2.label.verticalCenter = "bottom";



//-----------year slider
var yearSliderContainer = chart.createChild(am4core.Container);
yearSliderContainer.layout = "vertical";
yearSliderContainer.padding(10, 0, 0, 38);
yearSliderContainer.width = am4core.percent(100);

var yearSlider = yearSliderContainer.createChild(am4core.Slider);
yearSlider.height = 30;
yearSlider.events.on("rangechanged", function () {
    updateData(startYear + Math.round(yearSlider.start * (endYear - startYear)));
})

yearSlider.orientation = "horizontal";
yearSlider.start = 0;
yearSlider.exportable = false;

function updateData(year) {
    if (currentYear != year) {
    	series2.legendSettings.labelText = year;
        currentYear = year;

        yearLabel.text = "选择年份：" + currentYear;
		series2.name = currentYear + "";
		series2.dataFields.valueY = "temp" + currentYear;
		series2.tooltipText = "{name}：[bold]{valueY.value}[/]";

		// maxium value guide
		var max = -50;
		var min = 99;
		for (var i in data) {
			var t = data[i]['temp' + series2.name];
			if (t > max) {
				max = t;
			}

			if (t < min) {
				min = t;
			}
		}

		range.value = max;
		range.label.text = "最高温度 " + max;

		range2.value = min;
		range2.label.text = "最低温度 " + min;

        chart.invalidateRawData();
    }
}

chart.cursor = new am4charts.XYCursor();
chart.cursor.xAxis = dateAxis[0];

var scrollbarX = new am4charts.XYChartScrollbar();
scrollbarX.series.push(series1);
chart.scrollbarX = scrollbarX;

chart.legend = new am4charts.Legend();
chart.legend.parent = chart.plotContainer;
chart.legend.zIndex = 99;


var yearLabel = yearSlider.createChild(am4core.Label);
yearLabel.dx = 20;
yearLabel.dy = 1;
yearLabel.padding(3, 0, 3, 0);
yearLabel.fill = am4core.color("gray");
yearLabel.fontSize = 18;
yearLabel.text = "选择年份：" + currentYear;


//------ 降水
/*
// Create axes
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.minGridDistance = 40;
categoryAxis.title.text = "Countries";

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.title.text = "Litres sold (M)";

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "litres";
series.dataFields.categoryX = "country";
series.name = "Sales";
series.tooltipText = "{name}: [bold]{valueY}[/]";
*/





