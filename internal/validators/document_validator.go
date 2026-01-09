package validators

import (
	"regexp"
	"strconv"
)

// ValidateCPF validates Brazilian CPF (Cadastro de Pessoas Físicas)
func ValidateCPF(cpf string) bool {
	// Remove non-numeric characters
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	
	// Check length
	if len(cpf) != 11 {
		return false
	}
	
	// Check for known invalid CPFs (all same digits)
	allSame := true
	for i := 1; i < len(cpf); i++ {
		if cpf[i] != cpf[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}
	
	// Calculate first verification digit
	sum := 0
	for i := 0; i < 9; i++ {
		num, _ := strconv.Atoi(string(cpf[i]))
		sum += num * (10 - i)
	}
	digit1 := (sum * 10) % 11
	if digit1 == 10 {
		digit1 = 0
	}
	
	// Calculate second verification digit
	sum = 0
	for i := 0; i < 10; i++ {
		num, _ := strconv.Atoi(string(cpf[i]))
		sum += num * (11 - i)
	}
	digit2 := (sum * 10) % 11
	if digit2 == 10 {
		digit2 = 0
	}
	
	// Verify digits
	d1, _ := strconv.Atoi(string(cpf[9]))
	d2, _ := strconv.Atoi(string(cpf[10]))
	
	return d1 == digit1 && d2 == digit2
}

// ValidateCNPJ validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
func ValidateCNPJ(cnpj string) bool {
	// Remove non-numeric characters
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	
	// Check length
	if len(cnpj) != 14 {
		return false
	}
	
	// Check for known invalid CNPJs (all same digits)
	allSame := true
	for i := 1; i < len(cnpj); i++ {
		if cnpj[i] != cnpj[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}
	
	// Calculate first verification digit
	weights1 := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum := 0
	for i := 0; i < 12; i++ {
		num, _ := strconv.Atoi(string(cnpj[i]))
		sum += num * weights1[i]
	}
	digit1 := sum % 11
	if digit1 < 2 {
		digit1 = 0
	} else {
		digit1 = 11 - digit1
	}
	
	// Calculate second verification digit
	weights2 := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum = 0
	for i := 0; i < 13; i++ {
		num, _ := strconv.Atoi(string(cnpj[i]))
		sum += num * weights2[i]
	}
	digit2 := sum % 11
	if digit2 < 2 {
		digit2 = 0
	} else {
		digit2 = 11 - digit2
	}
	
	// Verify digits
	d1, _ := strconv.Atoi(string(cnpj[12]))
	d2, _ := strconv.Atoi(string(cnpj[13]))
	
	return d1 == digit1 && d2 == digit2
}

// FormatCPF formats CPF to XXX.XXX.XXX-XX
func FormatCPF(cpf string) string {
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	if len(cpf) != 11 {
		return cpf
	}
	return cpf[0:3] + "." + cpf[3:6] + "." + cpf[6:9] + "-" + cpf[9:11]
}

// FormatCNPJ formats CNPJ to XX.XXX.XXX/XXXX-XX
func FormatCNPJ(cnpj string) string {
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	if len(cnpj) != 14 {
		return cnpj
	}
	return cnpj[0:2] + "." + cnpj[2:5] + "." + cnpj[5:8] + "/" + cnpj[8:12] + "-" + cnpj[12:14]
}
