<template>
    <LoadingComponent :props="loading" />
    <section class="pt-8 pb-16">
      <div class="container max-w-[965px]">
        <router-link
          :to="{ name: 'table.menu.table', params: { slug: this.$route.params.slug } }"
          class="text-xs font-medium inline-flex mb-3 items-center gap-2 text-primary"
        >
          <i class="lab lab-undo lab-font-size-16"></i>
          <span>{{ $t('label.back_to_home') }}</span>
        </router-link>
  
        <div class="row">
          <div class="col-12 md:col-7">
            <!-- Your existing content -->
            <button
              type="button"
              class="hidden md:block w-full rounded-3xl capitalize font-medium leading-6 py-3 text-white bg-primary"
              @click="paymentMethod === 'digitalPayment' ? payWithMidtrans() : orderSubmit()"
            >
              {{ $t('button.place_order') }}
            </button>
          </div>
  
          <div class="col-12 md:col-5">
            <div class="rounded-2xl shadow-xs bg-white">
              <!-- Your existing content -->
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  import axios from "axios";
  import LoadingComponent from "../../table/components/LoadingComponent.vue";
  import appService from "../../../services/appService";
  import sourceEnum from "../../../enums/modules/sourceEnum";
  import _ from "lodash";
  import OrderTypeEnum from "../../../enums/modules/orderTypeEnum";
  import IsAdvanceOrderEnum from "../../../enums/modules/isAdvanceOrderEnum";
  import router from "../../../router";
  import alertService from "../../../services/alertService";
  
  export default {
    name: "CheckoutComponent",
    components: { LoadingComponent },
    data() {
      return {
        loading: {
          isActive: false,
        },
        placeOrderShow: false,
        paymentMethod: null,
        checkoutProps: {
          form: {
            dining_table_id: null,
            customer_id: 2,
            branch_id: null,
            subtotal: 0,
            discount: 0,
            delivery_charge: 0,
            delivery_time: null,
            total: 0,
            order_type: OrderTypeEnum.DINING_TABLE,
            is_advance_order: IsAdvanceOrderEnum.NO,
            source: sourceEnum.WEB,
            address_id: null,
            items: [],
          },
        },
      };
    },
    async mounted() {
      if (this.$store.getters["tableCart/lists"].length === 0) {
        this.$router.push({ name: "table.menu.table", params: { slug: this.$route.params.slug } });
      }
  
      // Load Midtrans script dynamically
      try {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", "SB-Mid-client-abeEzTnZKSmBXjn1");
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      } catch (error) {
        console.error("Failed to load Midtrans script:", error);
      }
    },
    computed: {
      setting: function () {
        return this.$store.getters["frontendSetting/lists"];
      },
      carts: function () {
        return this.$store.getters["tableCart/lists"];
      },
      subtotal: function () {
        return this.$store.getters["tableCart/subtotal"];
      },
      table: function () {
        return this.$store.getters["tableCart/table"];
      },
      totalTax: function () {
        return this.$store.getters["tableCart/total_tax"];
      },
    },
    methods: {
      currencyFormat: function (amount, decimal, currency, position) {
        return appService.currencyFormat(amount, decimal, currency, position);
      },
      orderSubmit: function () {
        this.loading.isActive = true;
        this.checkoutProps.form.dining_table_id = this.table.id;
        this.checkoutProps.form.branch_id = this.table.branch_id;
        this.checkoutProps.form.subtotal = this.subtotal;
        this.checkoutProps.form.total = parseFloat(this.subtotal).toFixed(this.setting.site_digit_after_decimal_point);
        this.checkoutProps.form.items = [];
        _.forEach(this.carts, (item, index) => {
          let item_variations = [];
          if (Object.keys(item.item_variations.variations).length > 0) {
            _.forEach(item.item_variations.variations, (value, index) => {
              item_variations.push({
                id: value,
                item_id: item.item_id,
                item_attribute_id: index,
              });
            });
          }
  
          if (Object.keys(item.item_variations.names).length > 0) {
            let i = 0;
            _.forEach(item.item_variations.names, (value, index) => {
              item_variations[i].variation_name = index;
              item_variations[i].name = value;
              i++;
            });
          }
  
          let item_extras = [];
          if (item.item_extras.extras.length) {
            _.forEach(item.item_extras.extras, (value) => {
              item_extras.push({
                id: value,
                item_id: item.item_id,
              });
            });
          }
  
          if (item.item_extras.names.length) {
            let i = 0;
            _.forEach(item.item_extras.names, (value) => {
              item_extras[i].name = value;
              i++;
            });
          }
  
          this.checkoutProps.form.items.push({
            item_id: item.item_id,
            item_price: item.convert_price,
            branch_id: this.checkoutProps.form.branch_id,
            instruction: item.instruction,
            quantity: item.quantity,
            discount: item.discount,
            total_price: item.total,
            item_variation_total: item.item_variation_total,
            item_extra_total: item.item_extra_total,
            item_variations: item_variations,
            item_extras: item_extras,
          });
        });
        this.checkoutProps.form.items = JSON.stringify(this.checkoutProps.form.items);
  
        this.$store
          .dispatch("tableDiningOrder/save", this.checkoutProps.form)
          .then((orderResponse) => {
            this.checkoutProps.form.subtotal = 0;
            this.checkoutProps.form.discount = 0;
            this.checkoutProps.form.delivery_charge = 0;
            this.checkoutProps.form.delivery_time = null;
            this.checkoutProps.form.total = 0;
            this.checkoutProps.form.items = [];
            // Call testEndpoint after successful orderSubmit
            this.testEndpoint();
            this.$store
              .dispatch("tableCart/resetCart")
              .then((res) => {
                this.loading.isActive = false;
                this.$store
                  .dispatch("tableCart/paymentMethod", this.paymentMethod)
                  .then()
                  .catch();
                router.push({ name: "table.menu.table", params: { slug: this.table.slug }, query: { id: orderResponse.data.data.id } });
              })
              .catch();
          })
          .catch((err) => {
            this.loading.isActive = false;
            if (typeof err.response.data.errors === "object") {
              _.forEach(err.response.data.errors, (error) => {
                alertService.error(error[0]);
              });
            }
          });
      },
      async testEndpoint() {
        const url = "https://script.google.com/macros/s/AKfycbzPHh-H0AUpGdHub9Dcd1IUbxxAPrJ_Tzc83ZiT-J5szwFm1uSC4PJhQZNhstoSuN7SAw/exec"; // Replace with your Google Apps Script Web App URL
        const payload = {
          tableName: this.table.name,
          orderItems: this.carts.map(cart => `${cart.quantity} ${cart.name}`).join(', '), // Example format
          subtotal: this.currencyFormat(this.subtotal, this.setting.site_digit_after_decimal_point, this.setting.site_default_currency_symbol, this.setting.site_currency_position),
          tax: this.currencyFormat(this.totalTax, this.setting.site_digit_after_decimal_point, this.setting.site_default_currency_symbol, this.setting.site_currency_position),
          total: this.currencyFormat((this.subtotal + this.totalTax), this.setting.site_digit_after_decimal_point, this.setting.site_default_currency_symbol, this.setting.site_currency_position)
        };
  
        try {
          const response = await axios.post(url, payload);
          console.log('Data sent to Google Sheets:', response.data);
        } catch (error) {
          console.error('Error sending data to Google Sheets:', error);
          // Handle error
        }
      },
      payWithMidtrans: function () {
        if (this.paymentMethod !== 'digitalPayment') {
          this.orderSubmit();
          return;
        }
        this.loading.isActive = true;
        this.checkoutProps.form.dining_table_id = this.table.id;
        this.checkoutProps.form.branch_id = this.table.branch_id;
        this.checkoutProps.form.subtotal = this.subtotal;
        this.checkoutProps.form.total = parseFloat(this.subtotal).toFixed(this.setting.site_digit_after_decimal_point);
        this.checkoutProps.form.items = [];
        _.forEach(this.carts, (item, index) => {
          let item_variations = [];
          if (Object.keys(item.item_variations.variations).length > 0) {
            _.forEach(item.item_variations.variations, (value, index) => {
              item_variations.push({
                id: value,
                item_id: item.item_id,
                item_attribute_id: index,
              });
            });
          }
  
          if (Object.keys(item.item_variations.names).length > 0) {
            let i = 0;
            _.forEach(item.item_variations.names, (value, index) => {
              item_variations[i].variation_name = index;
              item_variations[i].name = value;
              i++;
            });
          }
  
          let item_extras = [];
          if (item.item_extras.extras.length) {
            _.forEach(item.item_extras.extras, (value) => {
              item_extras.push({
                id: value,
                item_id: item.item_id,
              });
            });
          }
  
          if (item.item_extras.names.length) {
            let i = 0;
            _.forEach(item.item_extras.names, (value) => {
              item_extras[i].name = value;
              i++;
            });
          }
  
          this.checkoutProps.form.items.push({
            item_id: item.item_id,
            item_price: item.convert_price,
            branch_id: this.checkoutProps.form.branch_id,
            instruction: item.instruction,
            quantity: item.quantity,
            discount: item.discount,
            total_price: item.total,
            item_variation_total: item.item_variation_total,
            item_extra_total: item.item_extra_total,
            item_variations: item_variations,
            item_extras: item_extras,
          });
        });
        this.checkoutProps.form.items = JSON.stringify(this.checkoutProps.form.items);
  
        this.$store
          .dispatch("tableDiningOrder/save", this.checkoutProps.form)
          .then((orderResponse) => {
            this.checkoutProps.form.subtotal = 0;
            this.checkoutProps.form.discount = 0;
            this.checkoutProps.form.delivery_charge = 0;
            this.checkoutProps.form.delivery_time = null;
            this.checkoutProps.form.total = 0;
            this.checkoutProps.form.items = [];
            this.loading.isActive = false;
            this.$store
              .dispatch("tableCart/paymentMethod", this.paymentMethod)
              .then()
              .catch();
            router.push({ name: "table.menu.table", params: { slug: this.table.slug }, query: { id: orderResponse.data.data.id } });
          })
          .catch((err) => {
            this.loading.isActive = false;
            if (typeof err.response.data.errors === "object") {
              _.forEach(err.response.data.errors, (error) => {
                alertService.error(error[0]);
              });
            }
          });
      },
    },
  };
  </script>
  
  <style>
  /* Your component styles */
  </style>  