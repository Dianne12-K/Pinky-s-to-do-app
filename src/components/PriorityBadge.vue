<template>
  <span :class="[
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
    classes[priority] || classes.low
  ]">{{ priority }}</span>
</template>

<script setup>
defineProps({ priority: String })
const classes = {
  high:   'bg-pink-100 text-pink-600',
  medium: 'bg-yellow-50 text-yellow-700',
  low:    'bg-green-50 text-green-700',
}
</script>