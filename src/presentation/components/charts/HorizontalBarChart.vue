<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

defineProps<{
    labels: string[];
    data: number[];
    title: string;
}>();

const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
};
</script>

<template>
    <Bar 
        :data="{
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        }"
        :options="chartOptions"
    />
</template>
