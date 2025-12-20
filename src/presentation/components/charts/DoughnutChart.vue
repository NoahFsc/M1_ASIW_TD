<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

defineProps<{
    labels: string[];
    data: number[];
    colors: string[];
    title: string;
}>();

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                boxWidth: 15,
                padding: 10
            }
        }
    }
};
</script>

<template>
    <Doughnut 
        :data="{
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        }"
        :options="chartOptions"
    />
</template>
