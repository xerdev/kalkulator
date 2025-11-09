// Mengdefinisi kelas Kalkulator untuk mengelola logika
class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement, audioPlayer) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.audioPlayer = audioPlayer; // Menyimpan elemen audio
    this.clear();
  }

  // Fungsi untuk membersihkan semua (AC)
  clear() {
    this.currentOperand = '0'; // Set ke '0' agar tidak kosong
    this.previousOperand = '';
    this.operation = undefined;
    this.updateDisplay();
  }

  // Fungsi untuk menghapus satu digit (C)
  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    // Jika setelah dihapus jadi kosong, set ke '0'
    if (this.currentOperand === '') {
      this.currentOperand = '0';
    }
    this.updateDisplay();
  }

  // Fungsi untuk menambahkan angka atau titik
  appendNumber(number) {
    // Jika sudah ada titik dan tombol titik ditekan, abaikan
    if (number === '.' && this.currentOperand.includes('.')) return;
    // Jika angka saat ini '0' dan bukan titik, ganti '0' dengan angka baru
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
    this.updateDisplay();
  }

  // Fungsi untuk memilih operasi (+, -, ×, ÷)
  chooseOperation(operation) {
    if (this.currentOperand === '0' && this.previousOperand === '') return;
    
    // Jika ada operasi sebelumnya, hitung dulu
    if (this.previousOperand !== '') {
      this.compute(false); // Pass false karena ini bukan dari tombol =
    }
    
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '0';
    this.updateDisplay();
  }

  // Fungsi untuk menghitung hasil (=)
  compute(playSound = false) {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;

    // Menjalankan perhitungan berdasarkan operasi
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        computation = prev / current;
        break;
      default:
        return;
    }
    
    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
    this.updateDisplay();

    // Hanya memutar suara jika playSound = true (saat tombol = ditekan)
    if (playSound && this.audioPlayer) {
      this.audioPlayer.currentTime = 0; // Reset audio ke awal
      this.audioPlayer.play().catch(error => {
        // Menangani error jika audio gagal diputar (misal: perlu interaksi user)
        console.error("Gagal memutar audio:", error);
      });
    }
  }

  // Fungsi untuk memformat tampilan angka (misal: 1,000)
  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('id', { maximumFractionDigits: 0 });
    }
    
    if (decimalDigits != null) {
      return `${integerDisplay},${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  // Fungsi untuk memperbarui teks di layar
  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = 
        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }
}

// --- Menghubungkan Elemen DOM ke JavaScript ---

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const audioPlayer = document.getElementById('result-sound');

// Membuat instance baru dari Kalkulator
const calculator = new Calculator(
  previousOperandTextElement, 
  currentOperandTextElement,
  audioPlayer // Memberikan elemen audio ke class
);

// Menambahkan event listener untuk setiap tombol
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText);
  });
});

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.innerText);
  });
});

equalsButton.addEventListener('click', () => {
  calculator.compute(true); // Pass true untuk memutar suara saat tombol = ditekan
});

allClearButton.addEventListener('click', () => {
  calculator.clear();
});

deleteButton.addEventListener('click', () => {
  calculator.delete();
});