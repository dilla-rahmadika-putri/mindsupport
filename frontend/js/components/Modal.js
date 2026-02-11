// Modal Component
const ModalComponent = {
    template: `
    <div :class="['modal-overlay', { active: show }]" @click.self="$emit('close')">
      <div :class="['modal', sizeClass]">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  `,
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Modal'
        },
        size: {
            type: String,
            default: 'medium'
        }
    },
    computed: {
        sizeClass() {
            return 'modal-' + this.size;
        }
    },
    watch: {
        show(val) {
            if (val) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
};
