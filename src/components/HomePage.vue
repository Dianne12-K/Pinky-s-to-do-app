<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-green-400 p-6 relative overflow-hidden">
      <h1 class="text-6xl font-extrabold text-pink-700 mb-4">Pinky's To-Do List</h1>
  <!-- Display the image -->
  <img src="/images/LOVE.jpeg" alt="Pinky's Image" class="w-48 h-auto rounded-lg shadow-lg mt-4" />
      <p class="text-2xl text-gray-800">
        {{ currentTime.toLocaleDateString() }} - {{ currentTime.toLocaleTimeString() }}
      </p>
  
      <p class="mt-6 text-3xl text-gray-900 italic font-semibold">{{ getAffirmation() }}</p>
  
      <!-- "Let's Get Started" Button -->
      <button
        @click="goToTasks"
        class="absolute bottom-6 right-6 bg-pink-500 hover:bg-sky-700 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-pink-600"
      >
        Let's Get Started
      </button>
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  const currentTime = ref(new Date());
  const affirmations = {
    morning: "Rise and shine! Today is full of possibilities. ☀️",
    noon: "Keep pushing forward! You're doing amazing. 🌿",
    evening: "Rest and recharge. You deserve it. 🌙"
  };
  
  const getAffirmation = () => {
    const hours = currentTime.value.getHours();
    if (hours < 12) return affirmations.morning;
    if (hours < 18) return affirmations.noon;
    return affirmations.evening;
  };
  
  // Update time every second
  onMounted(() => {
    setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  });
  
  // Navigate to TaskPage
  const goToTasks = () => {
    router.push("/tasks");
  };
  </script>