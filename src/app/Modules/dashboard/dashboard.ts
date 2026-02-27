import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  ngOnInit() {
    this.createProductSalesChart();
    this.createCategoryChart();
    this.createCountriesChart();
  }

  createProductSalesChart() {
    const ctx = document.getElementById('productSalesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Revenue',
            data: [42000, 45000, 48000, 52000, 58000, 62000, 65000, 68000, 72000, 75000, 78000, 82187],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Gross Margin',
            data: [32000, 34000, 36000, 38000, 41000, 44000, 47000, 49000, 51000, 53000, 54000, 52187],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }

  createCategoryChart() {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Living room', 'Kids', 'Office', 'Bedroom', 'Kitchen', 
          'Bathroom', 'Dining room', 'Decor', 'Lighting', 'Outdoor'
        ],
        datasets: [{
          data: [25, 17, 13, 12, 9, 8, 6, 5, 3, 2],
          backgroundColor: [
            '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5',
            '#059669', '#047857', '#065f46', '#064e3b', '#022c22'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 15
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  createCountriesChart() {
    const ctx = document.getElementById('countriesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Poland', 'Austria', 'Spain', 'Romania', 'France', 'Italy', 'Germany', 'Ukraine'],
        datasets: [{
          label: 'Sales %',
          data: [19, 15, 13, 12, 11, 11, 10, 9],
          backgroundColor: '#10b981',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 25,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }
}