<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-pink-400 p-6">
        
        <h2 class="text-3xl font-extrabold text-gray-800 mb-4">Create Your Task</h2>
  
      <div class="flex space-x-2 mb-4">
        <input
          v-model="newTask"
          @keypress="handleKeyPress"
          type="text"
          placeholder="Enter a new task..."
          class="p-3 border rounded-lg w-64 focus:outline-none"
        />
        <button
          @click="addTask"
          class="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>
  
      <p class="text-lg text-gray-700">Pending tasks: {{ pendingTasks.length }}</p>
  
      <div class="flex space-x-4 mt-4">
        <button
          @click="showTasks = !showTasks"
          class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
        >
          {{ showTasks ? "Hide" : "Show" }} Task List
        </button>
  
        <button
          @click="showCompleted = !showCompleted"
          class="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
        >
          {{ showCompleted ? "Hide" : "Show" }} Completed Tasks
        </button>
      </div>
  
      <!-- Task List -->
      <ul v-if="showTasks" class="mt-4 w-80">
        <li
          v-for="(task, index) in pendingTasks"
          :key="index"
          class="flex justify-between items-center bg-gray-200 p-3 mb-2 rounded-lg"
        >
          <span class="text-gray-800">{{ task.text }}</span>
          <div class="space-x-2">
            <button
              @click="toggleComplete(task)"
              class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
            >
              Complete
            </button>
            <button
              @click="deleteTask(index)"
              class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
  
      <!-- Completed Tasks List -->
      <ul v-if="showCompleted" class="mt-4 w-80">
        <li
          v-for="(task, index) in completedTasks"
          :key="index"
          class="flex justify-between items-center bg-gray-300 p-3 mb-2 rounded-lg"
        >
          <span class="text-gray-600 line-through">{{ task.text }}</span>
          <button
            @click="deleteTask(index)"
            class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  </template>
  <script setup>
import { ref, computed, watch } from "vue";

const newTask = ref("");
const tasks = ref(JSON.parse(localStorage.getItem("tasks")) || []);
const showTasks = ref(false);
const showCompleted = ref(false);

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({ text: newTask.value, completed: false });
    newTask.value = "";
  }
};

const handleKeyPress = (event) => {
  if (event.key === "Enter") {
    addTask();
  }
};

const toggleComplete = (task) => {
  task.completed = !task.completed;
};

const deleteTask = (index) => {
  tasks.value.splice(index, 1);
};

const pendingTasks = computed(() => tasks.value.filter((task) => !task.completed));
const completedTasks = computed(() => tasks.value.filter((task) => task.completed));

// Save tasks to localStorage whenever they change
watch(tasks, (newTasks) => {
  localStorage.setItem("tasks", JSON.stringify(newTasks));
}, { deep: true });
</script>