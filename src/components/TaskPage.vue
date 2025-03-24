<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-pink-400 p-6 relative overflow-hidden">
    <!-- Title -->
    <h2 class="absolute top-4 left-6 text-3xl font-extrabold text-gray-800">
      Create Pinky's Task
    </h2>

    <!-- Task Input and Button -->
    <div class="absolute top-16 left-6 flex space-x-2">
      <input
        v-model="newTask"
        @keypress.enter="addTask"
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

    <!-- Task List Table (Aligned to Top-Right) -->
    <div class="absolute top-4 right-6 w-[calc(100%-450px)]">

      <table class="w-full bg-white shadow-md rounded-lg text-center">
        <thead class="bg-gray-300">
          <tr class="h-14"> 
            <th class="p-4 text-left">Task ID</th>
            <th class="p-4 text-left">Task List</th>
            <th class="p-4 text-left">Completed</th>
            <th class="p-4 text-left">Pending</th>
            <th class="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in paginatedTasks" :key="task.id" class="border-b h-12">
            <td class="p-4">{{ task.id }}</td>
            <td class="p-4 truncate">{{ task.text }}</td>
            <td class="p-4 text-green-600" v-if="task.completed">✔</td>
            <td class="p-4" v-else></td>
            <td class="p-4 text-red-600" v-if="!task.completed">✘</td>
            <td class="p-4" v-else></td>
            <td class="p-4 flex space-x-2">
              <button @click="toggleComplete(task)" class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">
                {{ task.completed ? 'Undo' : 'Complete' }}
              </button>
              <button @click="deleteTask(task.id)" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Buttons -->
      <div class="flex justify-center space-x-4 mt-4">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1" 
          class="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50">
          Previous
        </button>
        
        <span class="text-lg font-bold">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages" 
          class="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from "vue";

// Reactive Variables
const newTask = ref("");
const tasks = ref(JSON.parse(localStorage.getItem("tasks")) || []);
const currentPage = ref(1);
const tasksPerPage = 8;

// Function to Generate Unique Task ID
const generateId = () => {
  return tasks.value.length ? Math.max(...tasks.value.map(task => task.id)) + 1 : 1;
};

// Add Task
const addTask = () => {
  if (newTask.value.trim()) {
    // Increment all existing task IDs
    tasks.value.forEach(task => task.id++);

    // Add the new task with ID 1 at the top
    tasks.value.unshift({ id: 1, text: newTask.value, completed: false });

    // Clear input field
    newTask.value = "";
  }
};


// Toggle Completion
const toggleComplete = (task) => {
  task.completed = !task.completed;
};

// Delete Task by ID
const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId);
};

// Pagination Logic
const totalPages = computed(() => Math.ceil(tasks.value.length / tasksPerPage));

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * tasksPerPage;
  return tasks.value.slice(start, start + tasksPerPage); // No sorting by ID
});


const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Save to Local Storage
watch(tasks, (newTasks) => {
  localStorage.setItem("tasks", JSON.stringify(newTasks));
}, { deep: true });
</script>
