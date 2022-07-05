import Products from '../database/models/products'

export const addProduct = async (req: any, res: any) => {
    const checkProduct = await Products.findOne({ code: req.body.code })
    if (checkProduct) {
        checkProduct.set('quantity', req.body.quantity)
        await checkProduct.save()
    }
    else {
        const newProduct = new Products({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            description: req.body.description,
            image: req.body.image,
            code: req.body.code
        })
        await newProduct.save()
    }

    res.send({ msg: 'product added successfully' })
}