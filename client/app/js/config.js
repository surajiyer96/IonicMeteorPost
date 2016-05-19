angular.module('app.config', ['chart.js'])

    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#1976D2', '#1976D2'],
            maintainAspectRatio: false
        });
        
        ChartJsProvider.setOptions('Line', {
            datasetFill: false
        });
        
        ChartJsProvider.setOptions('Bar', {
            
        });
    }])   
