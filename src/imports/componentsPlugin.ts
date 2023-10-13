import type {App} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WButton from '@/components/Button/WButton.vue'
import WButtonAction from '@/components/Button/WButtonAction.vue'
import WButtonCopy from '@/components/Button/WButtonCopy.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WCounter from '@/components/Counter/WCounter.vue'
import WDatePicker from '@/components/DatePicker/WDatePicker.vue'
import WDatePickerSingle from '@/components/DatePicker/WDatePickerSingle.vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'
import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'
import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'
import WFilePicker from '@/components/FilePicker/WFilePicker.vue'
import WForm from '@/components/Form/WForm.vue'
import WFormValidator from '@/components/Form/WFormValidator.vue'
import WHeaderBar from '@/components/HeaderBar/WHeaderBar.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import WInfiniteListPages from '@/components/InfiniteList/WInfiniteListPages.vue'
import WInput from '@/components/Input/WInput.vue'
import WInputAsync from '@/components/Input/WInputAsync.vue'
import WInputDate from '@/components/Input/WInputDate.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import WLink from '@/components/Link/WLink.vue'
import WLinkArrow from '@/components/Link/WLinkArrow.vue'
import WModal from '@/components/Modal/WModal.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WNavBar from '@/components/Nav/WNavBar.vue'
import WNavItem from '@/components/Nav/WNavItem.vue'
import WNavItemExpand from '@/components/Nav/WNavItemExpand.vue'
import WNavItemTransition from '@/components/Nav/WNavItemTransition.vue'
import WNotify from '@/components/Notify/WNotify.vue'
import WSelect from '@/components/Select/WSelect.vue'
import WSelectAsync from '@/components/Select/WSelectAsync.vue'
import WSelectAsyncList from '@/components/Select/WSelectAsyncList.vue'
import WSelectSingle from '@/components/Select/WSelectSingle.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTabs from '@/components/Tabs/WTabs.vue'
import WToggle from '@/components/Toggle/WToggle.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import WTooltipContainer from '@/components/Tooltip/WTooltipContainer.vue'

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install: (app: App | any) => {
    app.component('WBottomSheet', WBottomSheet)
    app.component('WButton', WButton)
    app.component('WButtonAction', WButtonAction)
    app.component('WButtonCopy', WButtonCopy)
    app.component('WCheckbox', WCheckbox)
    app.component('WClickOutside', WClickOutside)
    app.component('WCounter', WCounter)
    app.component('WDatePicker', WDatePicker)
    app.component('WDatePickerSingle', WDatePickerSingle)
    app.component('WDropdown', WDropdown)
    app.component('WDropdownMenu', WDropdownMenu)
    app.component('WExpansion', WExpansion)
    app.component('WExpansionItem', WExpansionItem)
    app.component('WFieldWrapper', WFieldWrapper)
    app.component('WFilePicker', WFilePicker)
    app.component('WForm', WForm)
    app.component('WFormValidator', WFormValidator)
    app.component('WHeaderBar', WHeaderBar)
    app.component('WInfiniteList', WInfiniteList)
    app.component('WInfiniteListPages', WInfiniteListPages)
    app.component('WInput', WInput)
    app.component('WInputAsync', WInputAsync)
    app.component('WInputDate', WInputDate)
    app.component('WInputSuggest', WInputSuggest)
    app.component('WLink', WLink)
    app.component('WLinkArrow', WLinkArrow)
    app.component('WModal', WModal)
    app.component('WModalWrapper', WModalWrapper)
    app.component('WNavBar', WNavBar)
    app.component('WNavItem', WNavItem)
    app.component('WNavItemExpand', WNavItemExpand)
    app.component('WNavItemTransition', WNavItemTransition)
    app.component('WNotify', WNotify)
    app.component('WSelect', WSelect)
    app.component('WSelectAsync', WSelectAsync)
    app.component('WSelectAsyncList', WSelectAsyncList)
    app.component('WSelectSingle', WSelectSingle)
    app.component('WSkeleton', WSkeleton)
    app.component('WSpinner', WSpinner)
    app.component('WTabs', WTabs)
    app.component('WToggle', WToggle)
    app.component('WTooltip', WTooltip)
    app.component('WTooltipContainer', WTooltipContainer)
  },
}

export {
  WBottomSheet,
  WButton,
  WButtonAction,
  WButtonCopy,
  WCheckbox,
  WClickOutside,
  WCounter,
  WDatePicker,
  WDatePickerSingle,
  WDropdown,
  WDropdownMenu,
  WExpansion,
  WExpansionItem,
  WFieldWrapper,
  WFilePicker,
  WForm,
  WFormValidator,
  WHeaderBar,
  WInfiniteList,
  WInfiniteListPages,
  WInput,
  WInputAsync,
  WInputDate,
  WInputSuggest,
  WLink,
  WLinkArrow,
  WModal,
  WModalWrapper,
  WNavBar,
  WNavItem,
  WNavItemExpand,
  WNavItemTransition,
  WNotify,
  WSelect,
  WSelectAsync,
  WSelectAsyncList,
  WSelectSingle,
  WSkeleton,
  WSpinner,
  WTabs,
  WToggle,
  WTooltip,
  WTooltipContainer,
}