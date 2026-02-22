<template>
  <span :class="[
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
    classes[status] || classes.pending
  ]">{{ labels[status] || status }}</span>
</template>

<script setup>
defineProps({ status: String })
const classes = {
  pending:     'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-50 text-orange-600',
  completed:   'bg-green-50 text-green-700',
}
const labels = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Done',
}
</script>