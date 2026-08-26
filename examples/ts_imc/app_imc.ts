const BMI_CATEGORIES = {
    Underweight: "Underweight",
    NormalWeight: "Normal Weight",
    Overweight: "Overweight",
    Obesity: "Obesity"
}

// console.log(`${weight} / (${height ** 2})`)
const dataBody = {
    weight: 88,
    height: 1.79,
    gender: "male"
};

// const bmiData = calculateBMI(dataBody.peso, dataBody.altura);
const bmiData = calculateBMI(dataBody);
console.log(`BMI: ${bmiData.bmi}, category: ${bmiData.category}`);


function calculateBMI(
    { weight, height, gender }: 
    { weight: number, height: number, gender: string }): 
 { bmi: number, category: string } {
    let category: string;
    const bmi: number = weight / (height ** 2);

    if(bmi < 18.5) category = BMI_CATEGORIES.Underweight;
    else if(bmi >= 18.5 && bmi < 25) category = BMI_CATEGORIES.NormalWeight;
    else if(bmi >= 25 && bmi < 30) category = BMI_CATEGORIES.Overweight;
    else category = BMI_CATEGORIES.Obesity;

    return { bmi, category };
}
