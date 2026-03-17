import * as Yup from 'yup'

export const schema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Ingrese un email válido')
        .required('El email es requerido'),
    password: Yup.string().trim()
        .required('La contraseña es requerida'),
})