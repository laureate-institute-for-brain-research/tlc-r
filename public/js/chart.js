// Tulsa Life Chart 
// Source Code


function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return 'NULL'
}
var subject = getQueryVariable('subject');
subject = subject.toUpperCase()

var birthDate;
var assesseddate;
var group;

$.get('public/subjectsData/subjectsDB.json', function (data) {
  if (typeof data == 'string') {
    subjectJSON = JSON.parse(data)
  } else {
    subjectJSON = data
  }

  console.log(typeof data)
  birthDate = subjectJSON[subject].birthdate


  $(document).ready(function () {
    group = subjectJSON[subject].group
    document.getElementById('subject').innerHTML = subject.toUpperCase().replace('-', ' ') + ' - ' + group
  })


  console.log(subject)
  LC_AGE = parseInt(subjectJSON[subject].age);
  console.log('Age: ' + LC_AGE);
  if (LC_AGE <= 45) {
    $('#i').hide();
  }
  if (LC_AGE <= 35) {
    $('#h').hide();
  }
  if (LC_AGE <= 25) {
    $('#g').hide();
  }
  if (LC_AGE <= 18) {
    $('#f').hide();
  }
  if (LC_AGE <= 14) {
    $('#e').hide();
  }

});
// Hide Epoch Buttons Based on Age

var rangeSlider; // gloval variable for the range slider
var dashboard; // used for timeline chart


$(document).ready(function () {

  $("#nav-title").attr('href', '/tlc-r')

  document.getElementById('homenav').innerHTML = subject.toUpperCase()

  $('#homenav').attr('href', 'chart.html?subject=' + subject)
  $('#overall-count-nav-link').attr('href', 'overall.html?subject=' + subject);
  $('#bad-good-count-nav-link').attr('href', 'good-bad.html?subject=' + subject);
  $('#drug-count-nav-link').attr('href', 'drugs.html?subject=' + subject);
  $('#people-count-nav-link').attr('href', 'people.html?subject=' + subject);
  $('#hobbies-count-nav-link').attr('href', 'hobbies.html?subject=' + subject);
  $('#mental-ratio-nav-link').attr('href', 'mental.html?subject=' + subject);
  $('#resources-nav-link').attr('href', 'resources.html?subject=' + subject);

});

// Loading the Vsualziation API and the timepline package
google.charts.load('visualization', '43', {
  'packages': ['corechart', 'timeline', 'controls']
});

// set a callback when the Google Visualization API is loaded.
// Draw T
google.charts.setOnLoadCallback(getTimelineData);

// Draw Events Chart

function stringToArray(string) {
  // body...
  var line = string.split(/\r?\n/);
  var x = new Array(line.length);
  for (var i = 0; i < line.length; i++) {
    x[i] = line[i].split(',')
  }
  return x;
}

function returnDateObj(dates) {
  if (dates == undefined) {
    return null
  }
  datearray = dates.split('/');
  year = datearray[0]
  month = datearray[1]
  day = datearray[2]
  return new Date(dates)
}
// Will return the dates explicityly
// example: 1 year, 8, months, 3 days
function getDuration(start, end) {
  if (end == 'Invalid Date' || start == 'Invalid Date') {
    return ''
  } else {
    startdate = moment(start)
    enddate = moment(end)
    duration = moment.duration(enddate.diff(startdate))
    return `${duration.years()} Years<br>
                ${duration.months()} Months<br>
                ${duration.days()} Days
                `
  }

}


function getTooltipHTML(category, description, state, country, start, end) {
  // body...
  var m_names = new Array("Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul", "Aug", "Sept",
    "Oct", "Nov", "Dec");
  duration = getDuration(start, end);
  d1 = moment(start, 'DD/MM/YY', true).format('MMM YYYY')
  d2 = moment(end, 'DD/MM/YY', true).format('MMM YYYY')
  if (start == 'Invalid Date') {
    d1 = 'null'
  }
  if (end == 'Invalid Date') {
    d2 = 'null'
  }

  if (state == undefined) {
    state = ''
  }

  if (country == undefined) {
    country = ''
  }

  html = `<div style="padding:9px 12px 12px 9px;font-family: Lucida Grande; ">
          <table style="border-collapse: collapse;">
            <tr style="border-bottom: thin solid gray;">
              <th style="font-size: 12px;"><center><strong>${category}</strong></center></th>
            </tr>
            <tr>
              <th style="font-size: 14px;"><center>${description}</center></th>
            </tr>
            <tr>
              <td style="padding:5px 5px 5px 5px;font-size: 12px;"><center>${state}</center></td>
            </tr>
            <tr>
              <td style="padding:5px 5px 5px 5px;font-size: 12px;"><center>${country}</center></td>
            </tr>
            <tr>
              <td style="padding:5px 5px 5px 5px;font-size: 12px;"><center><strong></strong> ${duration}</center></td>
            </tr>
            <tr>
              <td style="padding:5px 5px 5px 5px;font-size: 11px;"><center><i>${d1 + ' - ' + d2}</i></center></td>
            </tr>
          </table>
        </div>`
  // console.log(html)
  return html

}

// Functio to get the timeline data, conce it does, invokes
// the drawTimelineChart() to then draw the chart.
function getTimelineData() {
  // Get File
  // console.log(subject)
  $.get('public/subjectsData/' + subject + '/' + subject + '-timeline-rev.csv', function (data) {
    // console.log(data)
    drawTimelineChart(data);
  })

}


/**
 * Workaround to fix the changed name for the mental tx label
 * @param {String} category 
 */
function filterCategory(category) {
  // console.log(category)
  if (category == 'Mental Health') {
    category = 'Mental Health'
  }
  return category
}


function drawTimelineChart(data) {
  finalData = [];

  fileArray = stringToArray(data);


  colorpalette = ['#358E96', '#3EA8B2', '#51BAC3', '#6CC5CD', '#86D0D7', '#A1DBE1', '#BCE6EA']
  // Raingbow:
  color1 = ['#e74c3c', '#e67e22', '#2980b9', '#f39c12', '#f1c40f', '#16a085', '#2980b9', '#2c3e50']
  color2 = ['#e84393', '#d63031', '#e17055', '#fdcb6e', '#00b894', '#00cec9', '#6c5ce7', '#b2bec3']
  color3 = ['#EA2027', '#EE5A24', '#FFC312', '#009432', '#0652DD', '#9980FA', '#D980FA', '#ED4C67'] // group decided on this
  color5 = ['#FC427B', '#FD7272', '#FD7272', '#F97F51', '#55E6C1', '#25CCF7', '#1B9CFC', '#D6A2E8']
  color6 = ['#fc5c65', '#fd9644', '#fed330', '#26de81', '#2bcbba', '#45aaf2', '#4b7bec', '#a55eea']
  color7 = ['#BC4943', '#C55F5A', '#CE7571', '#D78C88', '#DFA29F', '#E7B9B7', '#EFD0CF', '#F7E8E7']
  color = ['#182843', '#21385E', '#2A487A', '#325896', '#3B68B2', '#4C7AC5', '#678ECF']
  // color 4 is the default

  var colorsp = [];
  var colorMap = {
    // should contain a map of category -> color for every category
    'Drugs and Alcohol': color3[0],
    'Medical': color5[1],
    'Medication': color5[2],
    'Mental Health': color3[1],
    'Hobbies': color3[2],
    'People': color3[3],
    'Jobs': color3[4],
    'School': color3[5],
    'Residence': color3[6],
  }

  for (var i = 0; i < fileArray.length - 1; i++) {
    row = fileArray[i]


    order = row[0]
    category = filterCategory(row[1])
    period = row[2]
    startdate = returnDateObj(row[3])
    enddate = returnDateObj(row[4])
    birthdate = returnDateObj(row[5])
    assesseddate = returnDateObj(row[6])



    // swaps the date if one end date came before start date
    if (startdate.getTime() > enddate.getTime()) {
      tempdate = startdate;
      startdate = enddate;
      enddate = tempdate;
    }
    description = row[7].replace("\"", "")
    annotext = getthreeword(description)
    state = row[8]
    country = row[9]

    //console.log(birthdate)
    tooltiphtml = getTooltipHTML(category, description, state, country, startdate, enddate);

    if (enddate != 'Invalid Date') {
      // console.log(startdate._d)
      finalData.push([category, annotext, colorMap[category], tooltiphtml, startdate._d, enddate._d, birthdate, assesseddate]);
    }
  }

  // console.log(finalData)

  var data = new google.visualization.DataTable();
  // Inserting Date to the data object

  data.addColumn({
    type: 'string',
    id: 'Category'
  });
  //data.addColumn({ type: 'string', 'role': 'annotation'});
  data.addColumn({
    type: 'string',
    id: 'Name'
  });
  data.addColumn({
    type: 'string',
    role: 'style'
  });

  data.addColumn({
    type: 'string',
    role: 'tooltip',
    p: {
      'html': true
    }
  });
  data.addColumn({
    type: 'date',
    id: 'Start'
  });
  data.addColumn({
    type: 'date',
    id: 'End'
  });
  data.addColumn({
    type: 'date',
    id: 'birthdate',
    role: 'domain'
  });
  data.addColumn({
    type: 'date',
    id: 'assesseddate',
    role: 'domain'
  });
  data.addRows(finalData);

  var options = {
    width : 1000,
    height: fileArray.length * 16,
    tooltip: {
      isHtml: true
    },
    avoidOverlappingGridLines: true,
    // height: 100%,
    forceIFrame: false,
    hAxis: {
      maxValue: moment(new Date(assesseddate)).add('6', 'months')._d,
      gridLines: {
        count: 10
      }
    },
    timeline: {
      showBarLabels: true
    }

  };

  dashboard = new google.visualization.Dashboard(
    document.getElementById('timeline')
  );

  rangeSlider = new google.visualization.ControlWrapper({
    'controlType': 'ChartRangeFilter',
    'containerId': 'timeline_slider',
    'options': {
      'color': '#0000',
      // Filter by the date axis.
      'filterColumnIndex': 4,
      'ui': {
        'cssClass': 'rangeSlider',
        'chartType': 'TimeLine',
        'chartOptions': {
          'width': 1000,
          'height': 35,
          'chartArea': {
            'width': '100%', // make sure this is the same for the chart and control so the axes align right
            'height': '100%'
          },

          //'snapToData' : true
        },
        // This, this view has two columns: the start and end dates.
        'chartView': {

          'columns': [4, {
            type: 'number',
            calc: function () {
              return 0;
            }
          }]
        }
      }
    },

  });

  var categoryFilter = new google.visualization.ControlWrapper({
    'controlType': 'CategoryFilter',
    'containerId': 'timelineCategoryFilter',
    'options': {
      // Filter by the date axis.
      'filterColumnIndex': 0,
      'ui': {
        'caption': 'Select Category',
        'labelStacking': 'horizontal',
        'selectedValuesLayout': 'belowStacked',
        'allowTyping': false,
        'allowMultiple': true,
        'allowNone': true,
      },

    },

  });

  var timelineChart = new google.visualization.ChartWrapper({
    'chartType': 'Timeline',
    'containerId': 'timeline_chart',
    'options': options

  });

  categorySelectValues = ['Drugs and Alcohol', 'Hobbies', 'Jobs', 'Mental Health', 'People', 'Residence', 'School']

  categoryFilter.setState({
    'selectedValues': categorySelectValues
  })

  // call function onReady function when timeilnechart is read
  google.visualization.events.addListener(timelineChart, 'ready', onReady);


  //Put The text always on the right of the box if it it's small box
  function putTextLeft() {
    var container = document.getElementById('timeline_chart')
    var rectangles = container.getElementsByTagName('rect');
    for (var i = 0; i < rectangles.length; i++) {
      if (parseInt(rectangles[i].getAttribute('width')) <= 200) {
        if (i > 8) {

          text = rectangles[i].nextSibling

          if (text != null && text.tagName == 'text' && text.getAttribute('text-anchor') == 'end') {
            rectangleX = parseInt(rectangles[i].getAttribute('x'))
            rectangleWidth = parseInt(rectangles[i].getAttribute('width'))
            currentX = parseInt(text.getAttribute('x'))
            newX = rectangleX + 5
            // console.log(text.innerHTML + ': ' + text.getAttribute('x'))
            currentX = currentX + rectangleWidth
            text.setAttribute('text-anchor', 'start')
            text.setAttribute('x', newX + '')


            // Cutoff Text if width of rectangle is really small (< 50 width)
            // Decided not to substring the text 
            if (rectangleWidth <= 50 && text.innerHTML.length <= 50) {
              // text.innerHTML = text.innerHTML.substring(0,3)

            }

            // Cut longer if the width of rectangle is bigger
            if (rectangleWidth <= 100 && text.innerHTML.length <= 100) {
              text.innerHTML = text.innerHTML.substring(0, 10)
            }

            // If Rectangle is green and text is black, make text white
            if (rectangles[i].getAttribute('fill') == '#009432' && text.getAttribute('fill') == '#202020') {
              text.setAttribute('fill', '#ffffff')
            }
            // If Rectangle is blue and text is black, make text white
            if (rectangles[i].getAttribute('fill') == '#0652dd' && text.getAttribute('fill') == '#202020') {
              text.setAttribute('fill', '#ffffff')
            }
          }
        }

      }

    }
  }


  /**
   * Function used to call methods pertaining to the timelinechart
   */
  function onReady() {
    var container = document.getElementById('timeline_chart')
    var rectangles = container.getElementsByTagName('rect');
    var adjustY = 25;
    var adjustX = 15;

    // Add Black Borderin
    for (var i = 0; i < rectangles.length; i++) {
      rectangles[i].setAttribute('stroke', "#000000")
    }

    putTextLeft()
    // Keeps the Black Bordering on the events
    google.visualization.events.addListener(timelineChart.getChart(), 'onmouseout', function (element) {
      putTextLeft()
      var container = document.getElementById('timeline_chart')
      var rectangles = container.getElementsByTagName('rect');
      var adjustY = 25;
      var adjustX = 15;

      for (var i = 0; i < rectangles.length; i++) {

        rectangles[i].setAttribute('stroke', "#000000")

      }
    })
  }

  // Puts the age at the top of the timeilne chart
  google.visualization.events.addListener(timelineChart, 'ready', function () {
    var container = document.getElementById('timeline_chart')
    var g = container.getElementsByTagName("svg")[0].getElementsByTagName("g")[1]; // the Y axis labels for google cahrt

    container.getElementsByTagName("svg")[0].parentNode.style.top = '40px';
    container.getElementsByTagName("svg")[0].style.overflow = 'visible';
    var height = Number(g.getElementsByTagName("text")[0].getAttribute('y')) + 15;



    previousg = g.previousElementSibling // previous dom element after g
    g.setAttribute('id', 'og') // name the orignal g tag og
    newg = g.cloneNode(true); // copy the same
    newg.setAttribute('id', 'newg') // id the new g
    newg.setAttribute('transform', 'translate(0,-' + height + ')'); // put the newg in the top by transform

    var dates = newg.getElementsByTagName('text') // get all the texts (the hAxis labels of the timeline chart)
    for (var i = 0; i < dates.length; i++) {

      date = getAgeFromDate(dates[i].innerHTML, birthdate) // the date on the x axis
      // console.log(date)


      // if Nan, don't show the text
      if (isNaN(date)) {
        dates[i].style.display = "none"
      }

      // if bolded(means there was a month)
      // place the age a little higher up

      if (dates[i].getAttribute('font-weight') == 'bold') {
        y = dates[i].getAttribute('y')
        dates[i].setAttribute('y', y - 15)
        // offests the y position to place it 15 pixel height above the line

      }
      dates[i].innerHTML = date
    }
    previousg.after(newg)
    // previousg.append(g)
    // g.nextElementSibling = newg
    // newg.append(g)
    g = null;

  });

  dashboard.bind([rangeSlider, categoryFilter], timelineChart);
  dashboard.draw(data);
  //create trigger to resizeEnd event     
  $(window).resize(function () {
    if (this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function () {
      $(this).trigger('resizeEnd');
    }, 500);
  });

  //redraw graph when window resize is completed  
  $(window).on('resizeEnd', function () {
    dashboard.draw(data)
  });

  // Load/Execute the the function to make the eventchar when its' ready
  google.visualization.events.addOneTimeListener(dashboard, 'ready', drawEventsChart)

  //console.log(rangeSlider.getState())

  $('#load2wrap').attr('style', "display: none;")
  $('#load2wrap').attr('style', "padding: 0px;")
  $('#load2').attr('style', "display: none;")

  $('#drugs').change(function () {
    catstring = 'Drugs and Alcohol'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {

      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });


  $('#mental').change(function () {
    catstring = 'Mental Health'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {

      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });

  $('#hobbies').change(function () {
    catstring = 'Hobbies'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {
      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });

  $('#people').change(function () {
    catstring = 'People'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {
      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });

  $('#jobs').change(function () {
    catstring = 'Jobs'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {
      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });

  $('#school').change(function () {
    catstring = 'School'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {
      //'unchecked' event code
      //console.log('drugs unchecked')
      // Remove Drugs and Alcohol From the selected values
      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });

  $('#residence').change(function () {
    catstring = 'Residence'
    if ($(this).is(":checked")) {
      //'checked' event code
      categorySelectValues.push(catstring)
      //console.log('drugs checked')
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    } else {
      //'unchecked' event code
      //console.log('drugs unchecked')
      // Remove Drugs and Alcohol From the selected values
      index = categorySelectValues.indexOf(catstring)
      if (index > -1) {
        categorySelectValues.splice(index, 1)
      }
      categoryFilter.setState({
        'selectedValues': categorySelectValues
      })
      categoryFilter.draw()
    }

  });


  // Button Clicks for Epoch
  $("#all").click(function () {

    rangeSlider.setState({
      'range': {
        'start': periodDates('b', birthDate).start,
        'end': moment(new Date(assesseddate))._d
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html('All Epochs');
  });
  $("#b").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('b', birthDate).start,
        'end': periodDates('b', birthDate).end
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html("Birth-Elementary School Years");
  });
  $("#c").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('c', birthDate).start,
        'end': periodDates('c', birthDate).end
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html("Elementary School Years");
  });
  $("#d").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('d', birthDate).start,
        'end': periodDates('d', birthDate).end
      }
    })
    rangeSlider.draw();
    timelineChart.draw();
    $('#epochtitle').html("Middle School Years");
  });
  $("#e").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('e', birthDate).start,
        'end': periodDates('e', birthDate).end
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html("High School Years");
  });
  $("#f").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('f', birthDate).start,
        'end': periodDates('f', birthDate).end
      }
    })
    rangeSlider.draw();
    timelineChart.draw();
    $('#epochtitle').html("Young Adult Years");
  });
  $("#g").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('g', birthDate).start,
        'end': periodDates('g', birthDate).end
      }
    })
    rangeSlider.draw();
    timelineChart.draw();
    $('#epochtitle').html("Age: 25-35 ");
  });
  $("#h").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('h', birthDate).start,
        'end': periodDates('h', birthDate).end
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html("Age: 35-45 ");
  });
  $("#i").click(function () {
    //alert( "Handler for .click() called." );
    rangeSlider.setState({
      'range': {
        'start': periodDates('i', birthDate).start,
        'end': periodDates('i', birthDate).end
      }
    })
    rangeSlider.draw()
    timelineChart.draw();
    $('#epochtitle').html("Age: 45-55 ");
  });

}

/**
 * Returns JSON object of start and end date
 * @param {String} period period Letter
 * @param {String} birthdate birthdate String Date
 */
function periodDates(period, birthdate) {
  var start;
  var end;
  if (period == 'b') {
    start = moment(new Date(birthdate))._d
    console.log(start)
    end = moment(birthdate).add(6, 'years')._d
    console.log(end)
  } else if (period == 'c') {
    start = moment(birthdate).add(6, 'years')._d
    end = moment(birthdate).add(10, 'years')._d
  } else if (period == 'd') {
    start = moment(birthdate).add(10, 'years')._d
    end = moment(birthdate).add(14, 'years')._d
  } else if (period == 'e') {
    start = moment(birthdate).add(14, 'years')._d
    end = moment(birthdate).add(18, 'years')._d
  } else if (period == 'f') {
    start = moment(birthdate).add(18, 'years')._d
    end = moment(birthdate).add(25, 'years')._d
  } else if (period == 'g') {
    start = moment(birthdate).add(25, 'years')._d
    end = moment(birthdate).add(35, 'years')._d
  } else if (period == 'h') {
    start = moment(birthdate).add(35, 'years')._d
    end = moment(birthdate).add(45, 'years')._d
  } else if (period == 'i') {
    start = moment(birthdate).add(45, 'years')._d
    end = moment(birthdate).add(55, 'years')._d
  }
  dates = {
    start: start,
    end: end
  }
  // console.log(dates)

  return dates
}

/**
 * Return the age given a date and the birthdate
 * @param {Date} date 
 * @param {Date} birthdate 
 */
function getAgeFromDate(date, birthdate) {
  return moment(date).diff(moment(birthdate), 'years')
}


/**
 * Returns the birthday offset by age
 * @param {Integer} age Year
 * @param {Date} birthdate Birtdate
 */
function getDateFromAge(age, birthdate) {
  return moment(birthdate).add(age, 'years');
}


/**
 * returns the 1st three word of the string if
 * available
 * @param {String} text 
 */
function getthreeword(text) {
  words = text.split(' ');

  if (words[2] == undefined && words[1] == undefined) {
    return words[0]
  } else if (words[2] == undefined && words[1] != undefined) {
    return words[0] + ' ' + words[1]
  } else if (words[2] != undefined && words[1] != undefined) {
    return words[0] + ' ' + words[1] + ' ' + words[2]
  } else {
    return words[0]
  }
}


/**
 * Turn the string to a float, if null, than it returns null
 * @param {String} string 
 */
function getNumber(string) {
  if (string == '') {
    return null
  } else {
    return parseFloat(string)
  }
}


/**
 * Returns the tooltip html used to graph the the tooltips
 * @param {String} category 
 * @param {String} description 
 * @param {Integer} age 
 * @param {Date} start 
 * @param {Date} end 
 * @param {String} eventRating 
 */
function getEventTooltipHTML(category, description, age, start, end, eventRating, event_name) {
  // body...
  var m_names = new Array("Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul", "Aug", "Sept",
    "Oct", "Nov", "Dec");
  duration = getDuration(start, end);
  d1 = moment(start, 'DD/MM/YY', true).format('MMM YYYY')
  d2 = moment(end, 'DD/MM/YY', true).format('MMM YYYY')

  start_and_enddate = ''
  if (start == 'Invalid Date') {
    d1 = ''
  }
  if (end == 'Invalid Date') {
    d2 = ''
  }

  // Formatting the start and end date depending on available data
  if (d1 == '' && d2 == '') {
    start_and_enddate = ''
  } else if (d1 == '' && d2 != '') {
    start_and_enddate = d2
  } else if (d1 != '' && d2 == '') {
    start_and_enddate = d1
  } else {
    start_and_enddate = d1 + ' - ' + d2
  }


  html = `<div style="padding:9px 12px 12px 9px;font-family: Lucida Grande; background-color: black; border-radius:0.2rem;">
        <table style="border-collapse: collapse; border-color:black; background-color: black; border-radius:0.2rem;">
          <tr>
            <th style="font-size: 14px;color:white;"><center><strong>${event_name}</strong></center></th>
          </tr>
          <tr style="border-bottom: thin solid grey">
            <th style="font-size: 12px;color:white;"><center>${description}</center></th>
          </tr>
          <tr>
            <th style="font-size: 12px;color:white;"><center><strong>${category}: <strong>${eventRating}</center></th>
          </tr>
          <tr>
            <td style="padding:5px 5px 5px 5px;font-size: 12px; color:white;"><center><strong>Age: </strong>${age}</center></td>
          </tr>
          <tr>
            <td style="padding:5px 5px 5px 5px;font-size: 12px;color:white;"><center><strong></strong><span id = 'duration_format'>${duration}</span></center></td>
          </tr>
          <tr>
            <td style="padding:5px 5px 5px 5px;font-size: 11px;color:white;"><center><i>${start_and_enddate}</i></center></td>
          </tr>
        </table></div>`
  //console.log(html)
  return html

}
var moodrating = {}


/**
 * Used to dodge position of the age
 * @param {String} age 
 */
function isLastThreeTaken(age) {
  if ((parseInt(age) - 3).toString() in moodrating) {
    //console.log('triggered - 3 ' + age)
    return true
  }
  if ((parseInt(age) - 2).toString() in moodrating) {
    // console.log('triggered - 2 ' + age)
    return true
  }

  return false

}

/**
 * Re adjust the position since it overlap
 * @param {Int} age 
 * @param {Int} mood 
 */
function getNewMoodRating(age, mood) {
  // mood already in that corresponding age
  // return a shifted mood

  var DODGE_WIDTH = 0


  try {
    if (moodrating[age].includes(mood)) {
      moodrating[age].push(parseFloat(mood) + DODGE_WIDTH)
      // If there is a value at least 3 ages ago, then shift the rating up
      // even more
      if (isLastThreeTaken(age)) {
        return [age, parseFloat(mood) + DODGE_WIDTH * 1.5]
        console.log('triggered')
      } else {
        return [age, parseFloat(mood) + DODGE_WIDTH]
      }

      // mood is not in that corresponding age
      // return same mood and add to the array
    } else {
      moodrating[age].push(mood)
      if (isLastThreeTaken(age)) {
        return [age, parseFloat(mood) - DODGE_WIDTH]
      } else {
        return [age, mood]
      }

    }

  } catch (error) {
    // hasn't been added to the associatve array

    if (error instanceof TypeError) {
      moodrating[age] = [mood]
      if (isLastThreeTaken(age)) {
        // dodge width should change if the previous ages are taken
        //return [age,parseFloat(mood) + DODGE_WIDTH]
        return [age, parseFloat(mood)]
      } else {
        return [age, mood]
      }
    } else {
      console.log(error)
    }

  }


}

function getStyle(start, end) {
  if (enddate == 'Invalid Date' || enddate == null) {
    return ''
  } else {
    startdate = moment(start)
    enddate = moment(end)
    duration = moment.duration(enddate.diff(startdate))
    diffDays = duration.days()

    return ''
    // return 'point { shape-type: star; size: 9; sides: ' + diffDays + '; visible: true; }'
  }
}

/**
 * Used to Filter the description text.
 * 
 * @param {String} value 
 */
function filterDescription(value) {
  //console.log(value);
  if (value == undefined) {
    return ''
  } else {
    return value.replace('\"', '')
  }
}



/**
 * Return Duplicates
 * @param {Array} data 
 */
function findDuplicates(data) {

  let result = [];

  data.forEach(function (element, index) {

    // Find if there is a duplicate or not
    if (data.indexOf(element, index + 1) > -1) {

      // Find if the element is already in the result array or not
      if (result.indexOf(element) === -1) {
        result.push(element);
      }
    }
  });

  return result;
}

/**
 * returns the min difference of given array
 * @param {array} array 
 */
function getMinDifference(array) {
  diff = 1
  array.forEach(function (element, index) {
    try {
      if (array[index + 1] - array[index] <= diff) {
        diff = array[index + 1] - array[index]
      }
    } catch (e) {

    }
  })

  return diff

}

/**
 * Returns object of row and column index given age and rating
 * @param {googleDatatable} dataTable 
 * @param {Int} age 
 * @param {Int} rating 
 */
function returnIndex(finalData, age, rating) {
  idxojb = {}
  ratingColumnMap = {
    1: 1,
    2: 6,
    3: 11,
    4: 16,
    5: 21,
    6: 26,
    7: 31,
    8: 36,
    9: 41,
    10: 46
  }
  finalData.forEach((row, idx) => {

    if (row[0] == age && row[ratingColumnMap[rating]] == rating) {
      // console.log(ratingColumnMap[rating])
      idxojb.row = idx
      idxojb.col = ratingColumnMap[rating]
    }
  })

  return idxojb

}

/**
 * Use to get the events data  and draw the events chart
 */
function drawEventsChart() {
  // Some raw data (not necessarily accurate)
  var progressBar = document.getElementById("eventProgess");

  generateInfoTable()

  $.get('public/subjectsData/' + subject + '/' + subject + '-events-rev.csv', function (data) {
    finalEventData = [];

    // console.log('events data')
    // console.log(data)

    fileArray = stringToArray(data);



    // 2D array of age, rating) of all events
    eventTuple = []

    for (var i = 1; i < fileArray.length - 1; i++) {
      row = fileArray[i]

      for (var j = 2; j <= 11; j++) {
        if (row[j] != "") {
          eventTuple.push([row[0], row[j]])
        }
      }


      age = parseInt(row[0])


      periodrating = getNewMoodRating(age, getNumber(row[16]))[1]

      eventtype = row[1]

      // New Data points to help offset overlappint events
      newPoints = {
        '1': getNumber(row[2]),
        '2': getNumber(row[3]),
        '3': getNumber(row[4]),
        '4': getNumber(row[5]),
        '5': getNumber(row[6]),
        '6': getNumber(row[7]),
        '7': getNumber(row[8]),
        '8': getNumber(row[9]),
        '9': getNumber(row[10]),
        '10': getNumber(row[11])
      }

      one = getNumber(row[2])
      onenew = newPoints['1']


      two = getNumber(row[3])
      twonew = newPoints['2']

      three = getNumber(row[4])
      threenew = newPoints['3']

      four = getNumber(row[5])
      fournew = newPoints['4']

      five = getNumber(row[6])
      fivenew = newPoints['5']

      six = getNumber(row[7])
      sixnew = newPoints['6']

      seven = getNumber(row[8])
      sevennew = newPoints['7']

      eight = getNumber(row[9])
      ewightnew = newPoints['8']

      nine = getNumber(row[10])
      ninenew = newPoints['9']

      ten = getNumber(row[11])
      tennew = newPoints['10']

      agenew = getNewMoodRating(age, getNumber(row[16]))[0]


      startdate = returnDateObj(row[12])
      enddate = returnDateObj(row[13])

      event_name = row[14]

      eventdes = filterDescription(row[15])

      // If Age is null, there should be a start date.
      //

      if (one == null && two == null && three == null && four == null &&
        five == null && six == null && seven == null && eight == null &&
        nine == null && ten == null && eventtype != 'Period') {

        if (startdate) {

          eventAge = getAgeFromDate(startdate, birthdate)
          switch (eventAge) {
            case 1:
              onenew = 1
              break;
            case 2:
              twonew = 2
              break;
            case 3:
              threenew = 3
              break;
            case 4:
              fournew = 4
              break;
            case 5:
              fivenew = 5
              break;
            case 6:
              sixnew = 6
              break;
            case 7:
              sevennew = 7
              break;
            case 8:
              ewightnew = 8
              break;
            case 9:
              ninenew = 9
              break;
            case 10:
              tennew = 10
              break;

          }
        }
      }
      onetooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, one, event_name)
      twotooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, two, event_name)
      threetooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, three, event_name)
      fourtooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, four, event_name)
      fivetooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, five, event_name)
      sixtooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, six, event_name)
      seventooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, seven, event_name)
      eighttooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, eight, event_name)
      ninetooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, nine, event_name)
      tentooltip = getEventTooltipHTML(eventtype, eventdes, age, startdate, enddate, ten, event_name)

      // annotext = getthreeword(event_name)
      annotext = event_name

      if (enddate == "") {
        enddate = "NA"
      }
      finalRow = [
        agenew,
        onenew, onetooltip, event_name, eventdes, getStyle(startdate, enddate),
        twonew, twotooltip, event_name, eventdes, getStyle(startdate, enddate),
        threenew, threetooltip, event_name, eventdes, getStyle(startdate, enddate),
        fournew, fourtooltip, event_name, eventdes, getStyle(startdate, enddate),
        fivenew, fivetooltip, event_name, eventdes, getStyle(startdate, enddate),
        sixnew, sixtooltip, event_name, eventdes, getStyle(startdate, enddate),
        sevennew, seventooltip, event_name, eventdes, getStyle(startdate, enddate),
        ewightnew, eighttooltip, event_name, eventdes, getStyle(startdate, enddate),
        ninenew, ninetooltip, event_name, eventdes, getStyle(startdate, enddate),
        tennew, tentooltip, event_name, eventdes, getStyle(startdate, enddate),
        periodrating,
        eventtype,
      ]
      //console.log(finalRow);

      finalEventData.push(finalRow);
    }

    /**
     * Offset event data to prevent overlapping
     * @param {2d Array} data finalData
     */
    function offsetData(data) {
      data.forEach((row, index) => {
        if (index <= 2) return // skip first 2
        // Handle All 1
        if (row[1] == 1) {
          ratingOneAges = data.filter(i => {
            i[1] == 1
          })
          // row[1] = 0.5
          console.log(ratingOneAges)
        }
      })

    }
    // offsetData(finalData)

    // console.log(finalData);

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Age');

    data.addColumn('number', 'One');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Two');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Three');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Four');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Five');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Six');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Seven');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Eight');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Nine');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Ten');
    data.addColumn({
      'type': 'string',
      'role': 'tooltip',
      'p': {
        'html': true
      }
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotation'
    })
    data.addColumn({
      'type': 'string',
      'role': 'annotationText'
    })
    data.addColumn({
      'type': 'string',
      'role': 'style'
    })
    data.addColumn('number', 'Period Rating');
    data.addColumn({
      'type': 'string',
      'role': 'domain'
    });

    ages = []

    console.log(finalEventData)
    finalEventData.forEach((row, idx) => {
      ages.push(row[0])
    })
    ratingsindex = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51]
    duplicatesDict = {}
    // console.log(ages)
    findDuplicates(ages).forEach((row, index) => {
      // console.log(row)
      ratings = []
      duplicatesDict[row] = []

      finalEventData.forEach((elem, idx) => {
        if (row == elem[0]) {

          elem.forEach((colElemn, colidx) => {
            if (ratingsindex.includes(colidx) && !isNaN(elem[colidx]) && elem[colidx] != null) {
              // console.log({age: row, rating: elem[colidx]})
              duplicatesDict[row].push(elem[colidx])
            }
          })
        }
      })
    })

    // Iterate over the duplicates
    //  These are key = duplicated ages, and values that are arrays of mood ratings
    // age : [rating, rating]
    console.log(duplicatesDict)
    for (var age in duplicatesDict) {
      findDuplicates(duplicatesDict[age]).forEach((row, idx) => {
        console.log({
          age: age,
          rating: row
          // rating: row + .5
        })
        console.log(returnIndex(finalEventData, parseInt(age), row))
        rowidx = returnIndex(finalEventData, parseInt(age), row).row
        colidx = returnIndex(finalEventData, parseInt(age), row).col

        // finalEventData[rowidx][colidx] = row + 0.3
        console.log("TESTING HERE")
        console.log(finalEventData)
        finalEventData[rowidx][colidx] = row + 0.3
        finalEventData[rowidx][0] = parseInt(age) + 0.2

      })
    }
    // finalEventData[58][11] = 3.5
    // finalEventData[76][11] = 3.5

    console.log("final event data:")
    console.log(finalEventData)

    data.addRows(finalEventData)

    console.log("data:")
    console.log(data)

    var fontsize = 10

    var options = {
      height: 445,
      width: 1200,
      enableInteractivity: true,
      focusTarget: 'datum',
      aggregationTarget: 'category',
      tooltip: {
        isHtml: true,
        ignoreBounds: false,
        trigger: 'hover'
      },
      vAxis: {
        title: 'Mood Rating',
        gridlines: {
          color: 'white'
        },
        viewWindow: {
          min: null,
          max: null
        },
        // Show values from 1 - 10 ,but don't show the 0 and 11 values
        ticks: [{
            v: 0,
            f: ''
          },
          {
            v: 1,
            f: '1'
          },
          {
            v: 2,
            f: '2'
          },
          {
            v: 3,
            f: '3'
          },
          {
            v: 4,
            f: '4'
          },
          {
            v: 5,
            f: '5'
          },
          {
            v: 6,
            f: '6'
          },
          {
            v: 7,
            f: '7'
          },
          {
            v: 8,
            f: '8'
          },
          {
            v: 9,
            f: '9'
          },
          {
            v: 10,
            f: '10'
          },
          {
            v: 11,
            f: ''
          },
          {
            v: 12,
            f: ''
          },

        ]
      },
      hAxis: {
        title: 'Age',
        minValue: 0,
        maxValue: 10,
        viewWindow: {
          min: null,
          max: null
        },
        gridlines: {
          color: 'white'
        },
        ticks: _.range(0, LC_AGE + 4, 3)
      },
      legend: {
        position: 'none',
        'alignment': 'center'
      },
      chartArea: {
        top: 20,
        left: 50,
        width: '100%',
        height: '85%',
      },
      //curveType : 'funtion',
      //steppedArea
      series: {
        // Mood Rating: 1
        0: {
          type: 'scatter',
          color: '#0E0CE5',
          annotations: {
            stem: {
              length: -20
            }
          }

        },
        // Mood Rating: 2
        1: {
          type: 'scatter',
          color: '#0E09AB',
          annotations: {
            stem: {
              length: -15
            }
          }

        },
        // Mood Rating 3
        2: {
          type: 'scatter',
          color: '#000672',
          annotations: {
            stem: {
              length: 10
            }
          }

        },
        // Mood Rating 4
        3: {
          type: 'scatter',
          color: '#000339',
          annotations: {
            stem: {
              length: 15
            }
          }

        },
        // Mood Rating 5
        4: {
          type: 'scatter',
          color: '#000000',
          annotations: {
            stem: {
              length: 20
            }
          }

        },
        // Mood Rating 6
        5: {
          type: 'scatter',
          color: '#000000',
          annotations: {
            stem: {
              length: 15
            }
          }

        },
        // Mood Rating 7
        6: {
          type: 'scatter',
          color: '#3A0700',
          annotations: {
            stem: {
              length: 20
            }
          }

        },
        // Mood Rating 8
        7: {
          type: 'scatter',
          color: '#750F00',
          annotations: {
            stem: {
              length: 12
            }
          }

        },
        // Mood Rating 9
        8: {
          type: 'scatter',
          color: '#B01600',
          annotations: {
            stem: {
              length: 10
            }
          }

        },
        // Mood Rating 10
        9: {
          type: 'scatter',
          color: '#EB1E00',
          annotations: {
            stem: {
              length: 17
            }
          }


        },
        // Period Rating
        10: {
          type: 'scatter',
          lineWidth: 4,
          color: '#666666',
          visibleInLegend: false,
          areaOpacity: 1,
          enableInteractivity: false,
          // lineDashStyle: [20,1]
        }

      },
      annotations: {
        highContrast: false,
        datum: {
          stem: {
            length: 20,
            color: "#000000"
          }
        },
        textStyle: {
          fontSize: fontsize,
        }
      }

    };

    var eventdashboard = new google.visualization.Dashboard(
      document.getElementById('events')
    );

    var eventCategoryFilter = new google.visualization.ControlWrapper({
      'controlType': 'CategoryFilter',
      'containerId': 'eventsPicker',
      'options': {
        // Filter by the date axis.
        'filterColumnIndex': 52,
        'ui': {
          'caption': 'Select Event',
          'labelStacking': 'horizontal',
          'selectedValuesLayout': 'aside',
          'allowTyping': false,
          'allowMultiple': true,
          'allowNone': true,
        },

      },
    });

    var comboChart = new google.visualization.ChartWrapper({
      'chartType': 'ComboChart',
      'containerId': 'eventsChart',
      'options': options

    });


    eventSelected = ['Good Event', 'Bad Event', 'Period']
    eventCategoryFilter.setState({
      'selectedValues': eventSelected
    })

    /**
     * Returns JSON object of age(x) and rating(y)
     * @param {String} columnLabel Column Label 
     */
    function getAgeFromThreeWord(columnLabel) {

      rowindex = 0

      for (var i = 0; i < fileArray.length; i++) {
        row = fileArray[i]
        eventdes = filterDescription(row[15])
        // annotext = getthreeword(eventdes)
        annotext = event_name
        if (columnLabel == annotext) {
          return row[0]
        }
      }
    }

    /**
     * Returns Rating given column label
     * @param {String} columnLabel Column Label 
     */
    function getRatingFromThreeWord(columnLabel) {

      rowindex = 0

      for (var i = 0; i < fileArray.length; i++) {
        row = fileArray[i]
        eventdes = filterDescription(row[15])
        annotext = getthreeword(eventdes)
        if (columnLabel == annotext) {
          for (var j = 2; j <= 11; j++) {
            if (row[j] != "") {
              return row[j]
            }
          }
        }
      }
    }


    /**
     * Returns the Events locations If there is an event nearby
     * In other words, if the points (age, rating), lies within a rectangle
     * @param {Integer} age Age (x)
     * @param {Integer} rating Rating(y)
     */
    function surroundingEvents(age, rating) {
      result = []

      // Size of the rectangle
      x1 = age - 3
      y1 = rating - 1

      x2 = age + 3
      y2 = rating + 1

      eventTuple.forEach(function (anEvent) {

        // If the events lies within that rectangle then push to the resulting array
        if (parseInt(anEvent[0]) > x1 && parseInt(anEvent[0]) < x2 && parseInt(anEvent[1]) > y1 && parseInt(anEvent[1]) < y2) {
          result.push([parseInt(anEvent[0]), parseInt(anEvent[1])])
        }
      })
      return result
    }

    var container = document.getElementById('eventsChart');
    eventdashboard.bind(eventCategoryFilter, comboChart);
    eventdashboard.draw(data);

    //create trigger to resizeEnd event     
    $(window).resize(function () {
      if (this.resizeTO) clearTimeout(this.resizeTO);
      this.resizeTO = setTimeout(function () {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    //redraw graph when window resize is completed  
    $(window).on('resizeEnd', function () {
      eventdashboard.draw(data)
    });

    $('#load1wrap').attr('style', "display: none;")
    $('#load1').attr('style', "display: none;")
    $('#load1wrap').attr('style', "padding: 0px;")

    google.visualization.events.addOneTimeListener(comboChart, 'ready', function () {
      // Trigger PerioColor to set the same color
      $('#periodColor').trigger('change')
    })

    google.visualization.events.addListener(comboChart, 'ready', function () {


      // Add Duration Line on Hover
      google.visualization.events.addListener(comboChart.getChart(), 'onmouseover', function (e) {

        // adjustTextPosition()

        if (e.row && e.column) {
          // Clicked on point

          var el = document.getElementById('eventsChart');
          var line = document.createElement("div");
          line.id = 'duration_line'
          var interface = comboChart.getChart().getChartLayoutInterface();


          // Get the Duration Begin, End
          currentrating = data.getValue(e.row, e.column)
          age = data.getValue(e.row, 0)
          eventhtml = data.getValue(e.row, 27) // HTML Of the current event point


          var htmlobj = document.createElement('div');
          htmlobj.innerHTML = eventhtml;
          var tr = htmlobj.getElementsByTagName('tr');
          // duration = htmlobj.getElementById('duration_format')

          // console.log(tr)
          for (var i = 0; i < tr.length; i++) {

            innerstring = tr[i].innerText


            // If the Duration of the clicked point has Years, then we will add a duration line
            if (innerstring.includes('Years')) {
              durationyear = parseInt(innerstring.split('\n')[1].split(/,?\s+/)[1])
              durationmonths = parseInt(innerstring.split('\n')[2].split(/,?\s+/)[1])


              if (interface.getYLocation(currentrating) != null) {



                // Try to keep within the chart area
                maxWidth = interface.getChartAreaBoundingBox().width // usually always 420
                // console.log({year: durationyear, month: durationmonths})
                // console.log(age + durationyear + (durationmonths / 12))
                pointB = interface.getXLocation(age + durationyear + (durationmonths / 12))
                // console.log(pointB)


                if (pointB >= maxWidth) {
                  // console.log('width too big')
                  pointB = maxWidth + 50 // +50 offset from the actual chart

                }
                // console.log('ageLoc: ' + interface.getXLocation(age))
                // console.log('bLoc: ' + pointB)

                finallinewidthpx = pointB - interface.getXLocation(age) // Filtered Duration Line
                line.style.width = finallinewidthpx + "px";

                // console.log(interface.getYLocation(currentrating))
                line.style.display = 'block';
                line.style.background = getColorFromRating(parseInt(currentrating)) + "AA"

                line.style.position = "absolute";
                line.style.borderRadius = "1rem"
                line.style.left = interface.getXLocation(age) + "px";
                line.style.top = (interface.getYLocation(currentrating) - 6) + "px";
                line.style.height = '5px'
                line.classList = 'durationLineAnimation'

                break
              }
            }
          }


          // 

          el.appendChild(line);

        }
      });

      // Delete Duration Line on Mouse out
      google.visualization.events.addListener(comboChart.getChart(), 'onmouseout', function (e) {
        var el = document.getElementById('eventsChart');
        var line = document.getElementById("duration_line");
        el.removeChild(line); // Removes the duration line dic on mouse out

      });


    });


    // Alter Annotation Text position when the points are close
    // google.visualization.events.addListener(comboChart, 'ready', adjustTextPosition);


    // Changes the event chart when the range slider is changed
    google.visualization.events.addListener(rangeSlider, 'statechange', function () {

      max = getAgeFromDate(rangeSlider.getState().range.end, birthDate) // max determined by the range slider
      min = getAgeFromDate(rangeSlider.getState().range.start, birthDate) // min determined by the range slider

      // range slider chooses the age a a year before the subjec's birth date
      // so if it is -1, than it sets the events chart minimum window to age 0
      if (min == -1) {
        min = 0
      }

      options.hAxis.viewWindow.max = max + 7 // Show extra age after to show events on the max age
      options.hAxis.viewWindow.min = min - 3

      // Change the Timeline title depending on where in the range it is set are in
      changeTimelineTitle(min, max)

      // console.log(options.hAxis.viewWindow)
      options.hAxis.ticks = _.range(0, LC_AGE + 4, 1)
      comboChart.setOptions(options)
      comboChart.draw()
    });



    $('#all').click(function () {
      options.hAxis.viewWindow.max = LC_AGE + 4
      options.hAxis.viewWindow.min = 0
      // options.hAxis.ticks = null

      // rangeSlider.setState({start : 0, end: LC_AGE})
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#b').click(function () {
      options.hAxis.viewWindow.max = 6
      options.hAxis.viewWindow.min = 0
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })

    $('#c').click(function () {
      options.hAxis.viewWindow.max = 10
      options.hAxis.viewWindow.min = 6
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#d').click(function () {
      options.hAxis.viewWindow.max = 14
      options.hAxis.viewWindow.min = 10
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#e').click(function () {
      options.hAxis.viewWindow.max = 18
      options.hAxis.viewWindow.min = 14
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#f').click(function () {
      options.hAxis.viewWindow.max = 25
      options.hAxis.viewWindow.min = 18
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#g').click(function () {
      options.hAxis.viewWindow.max = 35
      options.hAxis.viewWindow.min = 25
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })
    $('#h').click(function () {
      options.hAxis.viewWindow.max = 45
      options.hAxis.viewWindow.min = 35
      options.hAxis.ticks = null
      comboChart.setOptions(options)
      comboChart.draw()
    })


    $('#good').change(function () {
      eventstring = 'Good Event'
      if ($(this).is(":checked")) {
        //'checked' event code
        eventSelected.push(eventstring)
        //console.log('drugs checked')
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      } else {
        index = eventSelected.indexOf(eventstring)
        if (index > -1) {
          eventSelected.splice(index, 1)
        }
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      }

      //console.log(eventSelected)
    });

    $('#bad').change(function () {
      eventstring = 'Bad Event'
      if ($(this).is(":checked")) {
        //'checked' event code
        eventSelected.push(eventstring)
        //console.log('drugs checked')
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      } else {
        index = eventSelected.indexOf(eventstring)
        if (index > -1) {
          eventSelected.splice(index, 1)
        }
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      }

    });

    $('#change').change(function () {
      eventstring = 'Change Event'
      if ($(this).is(":checked")) {
        //'checked' event code
        eventSelected.push(eventstring)
        //console.log('drugs checked')
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      } else {

        index = eventSelected.indexOf(eventstring)
        if (index > -1) {
          eventSelected.splice(index, 1)
        }
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      }

    });

    $('#other').change(function () {
      eventstring = 'Other Event'
      if ($(this).is(":checked")) {
        //'checked' event code
        eventSelected.push(eventstring)
        //console.log('drugs checked')
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      } else {

        index = eventSelected.indexOf(eventstring)
        if (index > -1) {
          eventSelected.splice(index, 1)
        }
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      }


    });

    $('#period').change(function () {
      eventstring = 'Period'
      if ($(this).is(":checked")) {
        //'checked' event code
        eventSelected.push(eventstring)
        //console.log('drugs checked')
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      } else {

        index = eventSelected.indexOf(eventstring)
        if (index > -1) {
          eventSelected.splice(index, 1)
        }
        eventCategoryFilter.setState({
          'selectedValues': eventSelected
        })
        eventCategoryFilter.draw()
      }


    });

    var oldColor = ''

    $('#periodColor').change(function () {
      eventstring = 'Period'
      color = document.getElementById('periodColor').value
      options.series[10].color = color

      comboChart.setOptions(options)
      comboChart.draw()

      // 
      var slider = document.getElementById('timeline_slider')
      var paths = slider.getElementsByTagName('path')
      // console.log(paths)

      for (let element of paths) {
        // console.log(element.getAttribute('stroke'))
        if (element.getAttribute('stroke') == '#3366cc' || element.getAttribute('stroke') == oldColor) {
          element.setAttribute('stroke', '#' + color)
          oldColor = '#' + color
        }
      }
    });
    $('#font-decrease').click(function () {

      var opt = comboChart.getOptions()

      fontsize = fontsize - 1
      // //console.log(opt)
      opt['annotations'] = {
        'textStyle': {
          'fontSize': fontsize
        }
      }
      comboChart.setOptions(opt)
      comboChart.draw()

    })

    $('#font-reset').click(function () {

      var opt = comboChart.getOptions()

      fontsize = 10
      // //console.log(opt)
      opt['annotations'] = {
        'textStyle': {
          'fontSize': fontsize
        }
      }
      comboChart.setOptions(opt)
      comboChart.draw()

    })

    $('#font-increase').click(function () {
      var opt = comboChart.getOptions()

      fontsize = fontsize + 1
      // //console.log(opt)
      opt['annotations'] = {
        'textStyle': {
          'fontSize': fontsize
        }
      }
      comboChart.setOptions(opt)
      comboChart.draw()
      //
    })
  });

}
/**
 * Returns the color give rating
 * @param {Number} rating 
 */
function getColorFromRating(rating) {
  if (rating == 1) { return '#0E09AB' }
  if (rating == 2) { return '#0E09AB' }
  if (rating == 3) { return '#000339' }
  if (rating == 4) { return '#000000' }
  if (rating == 5) { return '#000000' }
  if (rating == 6) { return '#3A0700' }
  if (rating == 7) { return '#750F00' }
  if (rating == 8) { return '#B01600' }
  if (rating == 9) { return '#EB1E00' }
  if (rating == 10) { return '#666666' }
  // Default
  return '#2e68c7'
}

// For Print Button
$(document).ready(function () {
  $('#download1').on('click', function () {
    // console.log($('#epochtitle').innerHTML)
    console.log(document.getElementById('epochtitle').innerHTML)
    $('#subject, #eventsChart, #epochtitle, #timeline_chart').printThis({
      importCSS: false,
      loadCSS: 'tlc/public/css/print.css',
      debug: false,
      // header: "<h1>Tulsa Life Chart</h1>",
      footer: null,
      pageTitle: "Tulsa Life Chart"
    });
  })
})

/**
 * Changes the Timeline Title depedning on range
 * @param {Int} startAge 
 * @param {*} endAge 
 */
function changeTimelineTitle(startAge, endAge) {
  $(document).ready(function () {
    $('#epochtitle').html("Age: " + startAge + ' - ' + endAge);
  })
}

function generateInfoTable() {
  $.get('public/subjectsData/' + subject + '/' + subject + '-info-rev.csv', function (data) {
    fileArray = data.split(',');

    infoTable = document.getElementById('subjectDescription')

    let tableIdx = 1
    fileArray.forEach((x) => {
      tableSlot = document.getElementById(`tableItem${tableIdx}`)
      tableSlot.innerText = x
      tableIdx++
    })
  });
}