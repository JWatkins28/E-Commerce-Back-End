const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {

    const categoryData = await Category.findAll({ include: [{ model: Product }] });

    res.status(200).json(categoryData)

  } catch (err) { res.status(500).json(err) }

});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {

    const categoryData = await Category.findByPk(req.params.id, { include: [{ model: Product }] });

    if (!categoryData) { return res.status(404).json({ message: 'No category found with this ID!' }) };

    res.status(200).json(categoryData)

  } catch (err) { res.status(500).json(err) }

});

router.post('/', async (req, res) => {
  // create a new category
  try {

    const categoryData = await Category.create(req.body);

    res.status(200).json(categoryData);

  } catch (err) { res.status(400).json(err) }

});

// UPDATE ROUTE
router.put('/:id', async (req, res) => {

  try {

    // update a category by its `id` value
    await Category.update(req.body, { where: { id: req.params.id } });

    // find all associated products
    const categoryProds = await Product.findAll({ where: { category_id: req.params.id } });

    // get list of all the product ids
    const categoryProdIds = await categoryProds.map(({ id }) => id);

    // create filtered list of new category_ids
    const newCategoryProds = await req.body.id
      .filter((id) => !categoryProdIds.includes(id))
      .map((id) => { return { id } })

    // figure out which ones to remove
    const categoryProdsToRemove = await categoryProds
      .filter(({ category_id }) => !req.body.id.includes(category_id))
      .map(({ id }) => id);

    // run both actions
    const updatedCategoryProds = await Promise.all([
      Product.destroy({ where: { id: categoryProdsToRemove } }),
      Product.bulkCreate(newCategoryProds),
    ]);

    return res.json(updatedCategoryProds)

  } catch (err) { res.status(400).json(err) }

});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
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
