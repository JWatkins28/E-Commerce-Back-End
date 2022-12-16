const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// API/CATEGORES ENDPOINT

// GET ALL CATEGORIES
router.get('/', async (req, res) => {

  try {

    const categoryData = await Category.findAll({ include: [{ model: Product }] });

    res.status(200).json(categoryData)

  } catch (err) { res.status(500).json(err) }

});

// FIND CATEGORY BY 'ID'
router.get('/:id', async (req, res) => {

  try {

    const categoryData = await Category.findByPk(req.params.id, { include: [{ model: Product }] });

    if (!categoryData) { return res.status(404).json({ message: 'No category found with this ID!' }) };

    res.status(200).json(categoryData)

  } catch (err) { res.status(500).json(err) }

});

// CREATE A NEW CATEGORY
router.post('/', async (req, res) => {

  try {

    const categoryData = await Category.create(req.body);

    res.status(200).json(categoryData);

  } catch (err) { res.status(400).json(err) }

});

// UPDATE CATEGORY BY 'ID'
router.put('/:id', async (req, res) => {

  try {

    // UPDATE THE CATEGORY
    await Category.update(req.body, { where: { id: req.params.id } });

    // FIND ATTACHED PRODUCTS
    const categoryProds = await Product.findAll({ where: { category_id: req.params.id } });

    // GET LIST OF ALL PRODUCT IDs
    const categoryProdIds = await categoryProds.map(({ id }) => id);

    // CREATE FILTERED LIST OF NEW CATEGORY_IDs
    const newCategoryProds = await req.body.id
      .filter((id) => !categoryProdIds.includes(id))
      .map((id) => { return { id } })

    // FIGURING OUT WHICH ONES TO REMOVE
    const categoryProdsToRemove = await categoryProds
      .filter(({ category_id }) => !req.body.id.includes(category_id))
      .map(({ id }) => id);

    // EXECUTE BOTH ACTIONS
    const updatedCategoryProds = await Promise.all([
      Product.destroy({ where: { id: categoryProdsToRemove } }),
      Product.bulkCreate(newCategoryProds),
    ]);

    // RETURN THE RESULT
    return res.json(updatedCategoryProds)

  } catch (err) { res.status(400).json(err) }

});

// DELETE CATEGORY BY 'ID'
router.delete('/:id', async (req, res) => {

  try {

    const categoryData = await Category.destroy({ where: { id: req.params.id } });

    if (!categoryData) {
      res.status(404).json({ message: 'No category with this ID!' });
      return;
    }

    res.status(200).json(categoryData);

  } catch (err) { res.status(500).json(err) }

});

module.exports = router;